var uuid = require("uuid")
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;

function getParameters(func) {
    var noComments = func.toString().replace(STRIP_COMMENTS, '');
    var result = noComments.slice(noComments.indexOf('(') + 1, noComments.indexOf(')')).match(ARGUMENT_NAMES);

    return result === null ? [] : result;
}

function isFunction(func) {
    return typeof func === "function";
}

function isArray(arr) {
    return arr && arr.constructor === Array;
}
function isString(s) {
    return s.constructor === String
}
function isValueType(s) {
    var t = typeof(s)
    
    return t === "boolean" ||
        t === "number"
}

function isObject(o) {
    return typeof o == "object"
}

function itemCount(obj) {
    if (isArray(obj)) {
        return obj.length
    }
    
    if (isObject(obj)) {
        return Object.keys(obj).length;
    }
    
    return undefined;
}

function firstOrDefault(arr, boolFunc) {
    for (var i in arr) {
        var item = arr[i];
        if (boolFunc(item)) {
            return item;
        }
    }
    return null;
}

function objectByString(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

function assignObjectByString(obj, str, value) {
    str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    str = str.replace(/^\./, '');           // strip a leading dot
    var a = str.split('.');
    for (var i = 0, n = a.length - 1; i < n; ++i) {
        var k = a[i];
        if (!(k in obj)) {
            obj[k] = {}
        } 
        obj = obj[k];
    }
    obj[a[i]] = value;
}

function getDateTime() {
    return new Date()
}

function getUniqueId() {
    return uuid.v4()
}

module.exports = {
    getParameters: getParameters,
    isFunction: isFunction,
    isArray: isArray,
    isString: isString,
    isValueType: isValueType,
    isObject: isObject,
    itemCount: itemCount,
    firstOrDefault: firstOrDefault,
    objectByString: objectByString,
    assignObjectByString: assignObjectByString,
    getDateTime: getDateTime,
    getUniqueId: getUniqueId
};