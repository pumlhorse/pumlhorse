var mod = pumlhorse.module("assert")
    .function("isTrue", ["@", isTrue], { passAsObject: true})
    .function("isFalse", ["@", isFalse], { passAsObject: true})
    .function("isNull", ["@", isNull], { passAsObject: true})
    .function("isNotNull", ["@", isNotNull], { passAsObject: true})
    .function("areEqual", areEqual)
    .function("areNotEqual", areNotEqual)
    .function("isEmpty", ["@", isEmpty], { passAsObject: true })
    .function("isNotEmpty", ["@", isNotEmpty], { passAsObject: true })
    .function("contains", ["array", "value", "partial", contains])
module.exports = mod.asExport();

var _ = require("underscore")
var enforce = require("../enforce")
var i18n = require("../script.i18n.js")
var helpers = require("../helpers.js")
    
function getRejected(cmd, expected, actual) {
    var error = new Error("Assertion '" + cmd + "' failed. Expected '" + expected + "', actual '" + actual + "'")
    error.command = cmd
    error.expected = expected
    error.actual = actual
    throw error
}

function isTrue(result) {
    if (result === true || result === "true") return;
    return getRejected("isTrue", true, result);
}

function isFalse(result) {
    if (result === false || result === "false") return;
    return getRejected("isFalse", false, result);
}

function isNull(result) {
    if (result === null || result === undefined) return;
    return getRejected("isNull", null, result);
}

function isNotNull(result) {
    if (result !== null && result !== undefined) return;
    return getRejected("isNotNull", {}, result);
}

function areEqual(expected, actual, partial) {    
    var values = [expected, actual]
    if (areEqualInternal(values, partial)) return;    
    
    return getRejected("areEqual", values[0], values[1]);
}

function areNotEqual(expected, actual) {
    var values = [expected, actual]
    if (!areEqualInternal(values)) return;
    return getRejected("areNotEqual", values[0], values[1]);
}

function isEmpty(actual) {
    enforce(actual)
        .isNotNull()
        .isArray()
    
    if (actual.length != 0) return getRejected("isEmpty", 0, actual.length);
}

function isNotEmpty(actual) {
    enforce(actual)
        .isNotNull()
        .isArray()
    
    if (actual.length == 0) return getRejected("isNotEmpty", "non-empty", 0);
}

function contains(array, expectedValue, partial) {
    enforce(array, "array")
        .isNotNull()
        .isArray()
    enforce(expectedValue, "value")
        .isNotNull()
   
    if (array.length == 0) throw new Error("Array does not contain value '" + expectedValue + "'. The array is empty")

    var isFound = false;
    var vals
    array.forEach(function (val) {
        vals = [expectedValue, val]
        if (areEqualInternal(vals, partial)) {
            isFound = true;
            return;
        }
    })
    
    if (isFound) return
    
    return getRejected("contains", vals[0], undefined);
}

function areEqualInternal(values, partialMatch) {
    var expected = values[0]
    var actual = values[1]
    if (!helpers.isObject(expected) || !helpers.isObject(actual)) {
        return expected === actual
    }
    
    values[0] = JSON.stringify(expected)
    values[1] = JSON.stringify(actual)
    if (partialMatch) {
        if (partialCompare(expected, actual)) return true;
    }
    else {
        if (_.isEqual(expected, actual)) return true;
    }
    
    return false
    
    function partialCompare(partial, complete) {
        if (!complete) return !partial
        if (!partial) return true
        
        if (helpers.isObject(partial)) {
            return _.keys(partial).every(function (key) {
                return partialCompare(partial[key], complete[key])
            })
        }
        
        return partial === complete
    }
}

