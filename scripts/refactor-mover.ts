import { Node, Project, SourceFile, Statement, SyntaxKind } from "ts-morph";

// --- CONFIGURATION ---
const TSCONFIG_PATH = "packages/kolmafia/tsconfig.json";
// ---------------------

// Helper: Safely calculate NodeNext compliant relative module paths
function getImportPath(from: SourceFile, to: SourceFile): string {
  const path = from.getRelativePathAsModuleSpecifierTo(to);
  return path.endsWith(".js") ? path : path.replace(/\.ts$/, "");
}

type Target = {
  stmt: Statement;
  originalFile: SourceFile;
  namespaceName: string;
  suffix: string;
  newFile: SourceFile;
  skipTypes: boolean;
};

// Helper: Finds which new file a node will eventually live in
function getDestinationFile(node: Node, targets: Target[]): SourceFile {
  const topLevelStmt = node
    .getAncestors()
    .find((a) => Node.isStatement(a) && a.getParent() === node.getSourceFile());
  if (topLevelStmt) {
    const tgt = targets.find((t) => t.stmt === topLevelStmt);
    if (tgt) return tgt.newFile;
  }
  return node.getSourceFile();
}

async function runRefactor() {
  const project = new Project({ tsConfigFilePath: TSCONFIG_PATH });

  // Dynamically find types.ts to ensure pathing differences don't break resolution
  const typesFile =
    project.getSourceFile((f) => f.getFilePath().endsWith("src/types.ts")) ||
    project.getSourceFile((f) => f.getBaseName() === "types.ts");

  if (!typesFile) {
    console.error(
      "CRITICAL ERROR: Could not locate types.ts in the project. Please ensure it exists.",
    );
    process.exit(1);
  }

  // PHASE 1: Collect Targets (Functions, Variables, Classes, Interfaces, Types)
  const targets: Target[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    for (const stmt of sourceFile.getStatements()) {
      let name = "";
      let nameNode: Node | undefined = undefined;

      if (
        Node.isFunctionDeclaration(stmt) ||
        Node.isClassDeclaration(stmt) ||
        Node.isInterfaceDeclaration(stmt) ||
        Node.isTypeAliasDeclaration(stmt)
      ) {
        name = stmt.getName() || "";
        nameNode = stmt.getNameNode();
      } else if (Node.isVariableStatement(stmt)) {
        const decls = stmt.getDeclarations();
        if (decls.length === 1) {
          name = decls[0].getName();
          nameNode = decls[0].getNameNode();
        }
      }

      if (!name || !nameNode || !name.includes("$$")) {
        continue;
      }

      const skipTypes = name.includes("$$$");
      const separator = skipTypes ? "$$$" : "$$";

      const lastIndex = name.lastIndexOf(separator);
      if (lastIndex === -1) continue;

      const leftPart = name.substring(0, lastIndex);
      const suffix = name.substring(lastIndex + separator.length);

      // Delimit any prefix to that $$, with $$ or $, it doesn't matter which
      const prefixMatch = leftPart.match(/^(.*?)(?:\$\$|\$)(.+)$/);
      const folder = prefixMatch ? prefixMatch[1] : "";
      const namespaceName = prefixMatch ? prefixMatch[2] : leftPart;

      const targetDir = folder
        ? sourceFile.getDirectory().getDirectory(folder) ||
          sourceFile.getDirectory().createDirectory(folder)
        : sourceFile.getDirectory();

      const newFileName = `${namespaceName.toLowerCase()}.ts`;
      const newFile =
        targetDir.getSourceFile(newFileName) ||
        targetDir.createSourceFile(newFileName, "");

      targets.push({
        stmt,
        originalFile: sourceFile,
        namespaceName,
        suffix,
        newFile,
        skipTypes,
      });
    }
  }

  console.log(`Found ${targets.length} declarations to refactor.`);

  // PHASE 2: Update References across the whole project IN PLACE
  type RefInfo = { ref: Node; target: Target };
  const refsByFile = new Map<SourceFile, RefInfo[]>();

  for (const target of targets) {
    let nameNode: Node | undefined = undefined;
    if (Node.isVariableStatement(target.stmt)) {
      nameNode = target.stmt.getDeclarations()[0].getNameNode();
    } else nameNode = (target.stmt as any).getNameNode();

    if (!nameNode) continue;

    const refs = nameNode.findReferencesAsNodes().filter((r) => r !== nameNode);
    for (const ref of refs) {
      const file = ref.getSourceFile();
      if (!refsByFile.has(file)) refsByFile.set(file, []);
      refsByFile.get(file)!.push({ ref, target });
    }
  }

  const importsToAdd = new Map<SourceFile, Set<string>>();

  for (const [file, fileRefs] of refsByFile.entries()) {
    // Process bottom-up to safely manipulate AST node text replacement
    fileRefs.sort((a, b) => b.ref.getPos() - a.ref.getPos());

    for (const { ref, target } of fileRefs) {
      const destFile = getDestinationFile(ref, targets);
      const isInternal = destFile === target.newFile;

      const importSpecifier = ref.getFirstAncestorByKind(
        SyntaxKind.ImportSpecifier,
      );
      if (importSpecifier) {
        const importDecl = importSpecifier.getFirstAncestorByKind(
          SyntaxKind.ImportDeclaration,
        );
        importSpecifier.remove();
        if (importDecl && importDecl.getNamedImports().length === 0) {
          importDecl.remove();
        }
        continue;
      }

      if (isInternal) {
        ref.replaceWithText(target.suffix);
      } else {
        ref.replaceWithText(`${target.namespaceName}.${target.suffix}`);

        // Register named import to be added from types.ts
        if (destFile !== typesFile) {
          if (!importsToAdd.has(destFile)) {
            importsToAdd.set(destFile, new Set());
          }
          importsToAdd.get(destFile)!.add(target.namespaceName);
        }
      }
    }
  }

  // Inject collected types.ts named imports (import { Namespace } from "../types")
  for (const [destFile, namespaces] of importsToAdd.entries()) {
    const modulePath = getImportPath(destFile, typesFile);
    let imp = destFile.getImportDeclaration(
      (i) =>
        i.getModuleSpecifierValue() === modulePath &&
        !i.getNamespaceImport() &&
        !i.getDefaultImport(),
    );
    if (!imp) {
      imp = destFile.addImportDeclaration({ moduleSpecifier: modulePath });
    }

    for (const ns of namespaces) {
      if (!imp.getNamedImports().some((ni) => ni.getName() === ns)) {
        imp.addNamedImport(ns);
      }
    }
  }

  // PHASE 3: Move declarations via raw text copy, migrate dependencies, & append exports to types.ts
  for (const target of targets) {
    const { stmt, originalFile, namespaceName, suffix, newFile, skipTypes } =
      target;

    console.log(`Skip types: ${skipTypes}`);
    if (!skipTypes) {
      const typesImportPath = getImportPath(typesFile, newFile);
      const exportText = `export * as ${namespaceName} from "${typesImportPath}";`;

      const hasExport = typesFile
        .getExportDeclarations()
        .some(
          (e) =>
            e.getText().includes(exportText) ||
            (e.getModuleSpecifierValue() === typesImportPath &&
              e.getNamespaceExport()?.getName() === namespaceName),
        );
      if (!hasExport) {
        typesFile.addStatements(exportText);
      }
    }

    // 1. Drop NamespaceName. prefix if we are already inside NamespaceName class/file
    const propertyAccesses = stmt.getDescendantsOfKind(
      SyntaxKind.PropertyAccessExpression,
    );
    // Sort reverse position safely to not invalidate prior AST replacements
    propertyAccesses.sort((a, b) => b.getPos() - a.getPos());
    for (const pae of propertyAccesses) {
      if (pae.getExpression().getText() === namespaceName) {
        pae.replaceWithText(pae.getNameNode().getText());
      }
    }

    // 2. Safely migrate/attach missing imports using the AST (includes local unmoved functions)
    migrateImports(stmt, originalFile, newFile, targets);

    let nameNode: Node | undefined = undefined;
    if (Node.isVariableStatement(stmt)) {
      nameNode = stmt.getDeclarations()[0].getNameNode();
    } else nameNode = (stmt as any).getNameNode();

    // 3. Text replacement to 100% guarantee exact formatting, spacing, and all comments
    const fullText = stmt.getFullText();
    const start = stmt.getFullStart();
    const namePos = nameNode!.getStart() - start;
    const nameEnd = nameNode!.getEnd() - start;
    const newText =
      fullText.substring(0, namePos) + suffix + fullText.substring(nameEnd);

    newFile.addStatements(newText);

    const originalName = nameNode!.getText();
    stmt.remove();
    console.log(
      `Moved ${originalName} -> ${newFile.getFilePath()} as ${namespaceName}.${suffix}`,
    );
  }

  await project.save();
  console.log("Refactoring complete!");
}

function addImportToTarget(
  targetFile: SourceFile,
  mod: string,
  name: string,
  kind: SyntaxKind,
) {
  if (kind === SyntaxKind.ImportSpecifier) {
    let imp = targetFile.getImportDeclaration(
      (i) =>
        i.getModuleSpecifierValue() === mod &&
        !i.getNamespaceImport() &&
        !i.getDefaultImport(),
    );
    if (!imp) {
      imp = targetFile.addImportDeclaration({ moduleSpecifier: mod });
    }

    if (!imp.getNamedImports().some((ni) => ni.getName() === name)) {
      imp.addNamedImport(name);
    }
  } else if (kind === SyntaxKind.NamespaceImport) {
    if (
      !targetFile.getImportDeclaration(
        (i) =>
          i.getModuleSpecifierValue() === mod &&
          i.getNamespaceImport()?.getText() === name,
      )
    ) {
      targetFile.addImportDeclaration({
        moduleSpecifier: mod,
        namespaceImport: name,
      });
    }
  } else if (kind === SyntaxKind.ImportClause) {
    if (
      !targetFile.getImportDeclaration(
        (i) =>
          i.getModuleSpecifierValue() === mod &&
          i.getDefaultImport()?.getText() === name,
      )
    ) {
      targetFile.addImportDeclaration({
        moduleSpecifier: mod,
        defaultImport: name,
      });
    }
  }
}

// Helper: Migrates missing imports required by the moved statement into its new file
function migrateImports(
  stmt: Statement,
  originalFile: SourceFile,
  targetFile: SourceFile,
  targets: Target[],
) {
  const typeChecker = originalFile.getProject().getTypeChecker();

  for (const id of stmt.getDescendantsOfKind(SyntaxKind.Identifier)) {
    // Skip checking rights-sides of `SwordFam.function`
    if (
      id.getParentIfKind(SyntaxKind.PropertyAccessExpression)?.getNameNode() ===
      id
    ) {
      continue;
    }

    const symbol = typeChecker.getSymbolAtLocation(id);
    if (!symbol) continue;

    for (const decl of symbol.getDeclarations() || []) {
      const declFile = decl.getSourceFile();
      if (declFile !== originalFile) continue; // Globals & already external files handled elsewhere

      const importDecl = decl.getFirstAncestorByKind(
        SyntaxKind.ImportDeclaration,
      );

      // Case 1: Symbol was originally imported into the file. Copy that import.
      if (importDecl) {
        let mod = importDecl.getModuleSpecifierValue();
        if (mod.startsWith(".")) {
          const importedFile = importDecl.getModuleSpecifierSourceFile();
          if (importedFile) mod = getImportPath(targetFile, importedFile);
        }

        const name = id.getText();
        const kind = decl.getKind();
        addImportToTarget(targetFile, mod, name, kind);
      } else {
        // Case 2: Symbol resides locally in the original file (a non-imported local function/class/variable)
        // Check if it's already one of our targets meant to be handled by phase 2
        const isMoved = targets.some(
          (t) =>
            t.stmt === decl ||
            (decl.getPos() >= t.stmt.getPos() &&
              decl.getEnd() <= t.stmt.getEnd()),
        );

        if (!isMoved) {
          const mod = getImportPath(targetFile, originalFile);
          const name = id.getText();

          // Ensure the local declaration is forcefully exported so we don't break strict TS rules upon import.
          if (Node.isExportable(decl) && !decl.isExported()) {
            decl.setIsExported(true);
          } else if (Node.isVariableDeclaration(decl)) {
            const varStmt = decl.getVariableStatement();
            if (varStmt && !varStmt.isExported()) {
              varStmt.setIsExported(true);
            }
          }

          addImportToTarget(targetFile, mod, name, SyntaxKind.ImportSpecifier);
        }
      }
    }
  }
}

runRefactor().catch(console.error);
