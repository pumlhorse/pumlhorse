import * as _ from 'underscore';

export { getParameters, isValueType, objectByString, assignObjectByString, getItemCount }

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParameters(func): string[] {
    var noComments = func.toString().replace(STRIP_COMMENTS, '');
    var result = noComments.slice(noComments.indexOf('(') + 1, noComments.indexOf(')')).match(ARGUMENT_NAMES);

    return result === null ? [] : result;
}

function isValueType(s) {
    var t = typeof(s)
    
    return t === "boolean" || t === "number";
}

function objectByString<T>(o: Object, s: string): T {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return null;
        }
    }
    return <T>o;
}

function assignObjectByString(obj: Object, str: string, value: any) {
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


function getItemCount(obj: any[] | Object) {
    if (_.isArray(obj)) {
        return obj.length
    }
    
    if (_.isObject(obj)) {
        return Object.keys(obj).length;
    }
    
    return undefined;
}