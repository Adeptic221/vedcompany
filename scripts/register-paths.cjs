const Module = require("module");
const path = require("path");

const srcRoot = path.join(__dirname, "..", "src");

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    request = path.join(srcRoot, request.slice(2));
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
