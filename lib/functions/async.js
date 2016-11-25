var mod = pumlhorse.module("async")
    .function("parallel", ["@", runParallel], { passAsObject: true})
module.exports = mod.asExport();

var enforce = require("../enforce")

function runParallel(steps) {

    var scope = this;
    enforce(steps)
        .isNotNull()
        .isArray()

    return scope.$Promise.all(steps.map((step) => scope.$runSteps([step])))
}