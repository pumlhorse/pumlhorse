import * as _ from 'underscore';

export { getParameters, isValueType, objectByString, assignObjectByString, getItemCount }

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
function getParameters(func): string[] {
    const noComments = func.toString().replace(STRIP_COMMENTS, '');
    const result = noComments.slice(noComments.indexOf('(') + 1, noComments.indexOf(')')).match(ARGUMENT_NAMES);

    return result === null ? [] : result;
}

function isValueType(s) {
    return _.isNumber(s) ||
        _.isString(s) ||
        _.isBoolean(s) ||
        _.isDate(s);
}

function objectByString<T>(obj: Object, path: string): T {
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    if (path[0] == '.') { path = path.substr(1); }// strip a leading dot
    const parts = path.split('.');
    for (let i = 0, n = parts.length; i < n; ++i) {
        const key = parts[i];
        if (key in obj) {
            obj = obj[key];
        } else {
            return null;
        }
    }
    return <T>obj;
}

function assignObjectByString(obj: Object, path: string, value: any) {
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    if (path[0] == '.') { path = path.substr(1); }// strip a leading dot
    const parts = path.split('.');
    let i = 0;
    for (let n = parts.length - 1; i < n; ++i) {
        const key = parts[i];
        if (!(key in obj)) {
            obj[key] = {}
        } 
        obj = obj[key];
    }
    obj[parts[i]] = value;
}


function getItemCount(obj: any[] | Object) {
    if (_.isArray(obj)) {
        return (<any[]>obj).length;
    }
    
    if (_.isObject(obj)) {
        return Object.keys(obj).length;
    }
    
    return undefined;
}