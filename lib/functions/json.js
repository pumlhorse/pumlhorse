function jsonToObject() {
    if (arguments.length == 0)
    {
        throw new Exception("No value passed to 'toJson'")
    }
    return JSON.parse(arguments[0])
}

function objectToJson() {
    if (arguments.length == 0)
    {
        throw new Exception("No value passed to 'fromJson'")
    }
    return JSON.stringify(arguments[0])
}

module.exports = pumlhorse.module("json")
    .function("fromJson", jsonToObject)
    .function("toJson", objectToJson).asExport();