var mod = pumlhorse.module("conditional")
    .function("if", ["value", "is true", "is false", ifStatement])
module.exports = mod.asExport();

var _ = require("underscore")

function ifStatement(value, isTrue, isFalse) {

    if (isTrue != null && !_.isArray(isTrue)) {
        throw new Error("'is true' must be an array")
    }
    
    if (isFalse != null && !_.isArray(isFalse)) {
        throw new Error("'is false' must be an array")
    }

    var scope = this;
    if (value) {
        if (isTrue) {
            return scope.$runSteps(isTrue, scope.$new())
        } 
    }
    else {
        if (isFalse) {
            return scope.$runSteps(isFalse, scope.$new())
        }
    }
}