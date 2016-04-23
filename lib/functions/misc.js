var mod = pumlhorse.module("misc")
    .function("value", returnValue, {
        passAsObject: true
    });
module.exports = mod.asExport();

function returnValue() {
    return arguments[0];
}