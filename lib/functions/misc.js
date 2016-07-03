var mod = pumlhorse.module("misc")
    .function("value", [ "@", returnValue], {
        passAsObject: true
    })
    .function("import", [ "@", importFunc], {
        passAsObject: true
    });
module.exports = mod.asExport();

var requireFromPath = require("../requireFromPath")

function returnValue(val) {
    return val;
}

function importFunc(moduleName) {
    return requireFromPath(moduleName, this.__filename)
}