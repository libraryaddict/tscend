"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

// packages/relay/src/autoscend_getsession.ts
var autoscend_getsession_exports = {};
__export(autoscend_getsession_exports, {
  main: () => main
});
module.exports = __toCommonJS(autoscend_getsession_exports);
var import_kolmafia = require("kolmafia");
function main() {
  (0, import_kolmafia.write)(JSON.stringify({ name: (0, import_kolmafia.myName)(), hash: (0, import_kolmafia.myHash)() }));
}
