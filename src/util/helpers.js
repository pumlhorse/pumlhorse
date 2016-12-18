"use strict";
var _ = require("underscore");
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParameters(func) {
    var noComments = func.toString().replace(STRIP_COMMENTS, '');
    var result = noComments.slice(noComments.indexOf('(') + 1, noComments.indexOf(')')).match(ARGUMENT_NAMES);
    return result === null ? [] : result;
}
exports.getParameters = getParameters;
function isValueType(s) {
    var t = typeof (s);
    return t === "boolean" || t === "number";
}
exports.isValueType = isValueType;
function objectByString(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1');
    s = s.replace(/^\./, '');
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        }
        else {
            return null;
        }
    }
    return o;
}
exports.objectByString = objectByString;
function assignObjectByString(obj, str, value) {
    str = str.replace(/\[(\w+)\]/g, '.$1');
    str = str.replace(/^\./, '');
    var a = str.split('.');
    for (var i = 0, n = a.length - 1; i < n; ++i) {
        var k = a[i];
        if (!(k in obj)) {
            obj[k] = {};
        }
        obj = obj[k];
    }
    obj[a[i]] = value;
}
exports.assignObjectByString = assignObjectByString;
function getItemCount(obj) {
    if (_.isArray(obj)) {
        return obj.length;
    }
    if (_.isObject(obj)) {
        return Object.keys(obj).length;
    }
    return undefined;
}
exports.getItemCount = getItemCount;
//# sourceMappingURL=helpers.js.map