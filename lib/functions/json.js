module.exports = pumlhorse.module("json")
    .function("fromJson", ["@", jsonToObject], { passAsObject: true })
    .function("toJson", ["@", objectToJson], { passAsObject: true })
    .asExport();
    
function jsonToObject(val) {
    if (val == undefined)
    {
        throw new Exception("No value passed to 'toJson'")
    }
    return JSON.parse(val)
}

function objectToJson(val) {
    if (val == undefined)
    {
        throw new Exception("No value passed to 'fromJson'")
    }
    return JSON.stringify(val)
}