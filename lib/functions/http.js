var http = require("http-client-factory")
var helpers = require("../helpers")


var verbs = ["get", "post", "put", "delete", "patch", "options", "head"]

var mod = pumlhorse.module("http")
verbs.forEach(function (v) {
    mod.function(v, getPassThrough(v))
})
/* General purpose */
addOneParamFunction("isInformational", isRange(100, 199))
addOneParamFunction("isSuccess", isRange(200, 299))
addOneParamFunction("isRedirect", isRange(300, 399))
addOneParamFunction("isError", isRange(400, 599))
/* Specific error codes */
addOneParamFunction("isOk", isCode(200))
addOneParamFunction("isNotModified", isCode(304))
addOneParamFunction("isBadRequest", isCode(400))
addOneParamFunction("isUnauthorized", isCode(401))
addOneParamFunction("isForbidden", isCode(403))
addOneParamFunction("isNotFound", isCode(404))
addOneParamFunction("isNotAllowed", isCode(405))
/* Deserialization */
addOneParamFunction("body", getJsonBody)

function addOneParamFunction(name, func) {
    mod.function(name, ["@", func], { passAsObject: true })
}

module.exports = mod.asExport()

function getPassThrough(verb) {
    return function (url, data, headers) {
        
        var requestId = helpers.getUniqueId()
        function getRequestEventData() {
            return {
                method: verb,
                url: url,
                data: data,
                headers: headers,
                requestStart: helpers.getDateTime(),
                id: requestId
            }
        }
        
        function getResponseEventData(response) {
            return {
                status: response.statusCode,
                statusMessage: response.statusMessage,
                body: response.body,
                headers: response.headers,
                requestEnd: helpers.getDateTime(),
                requestId: requestId
            }
        }
        
        if (!url || url.length == 0) {
            throw new Error("URL is required")
        }
        
        var client = http.getClient();
        
        if (headers) {
        for (var x in headers) {
                client.addHeader(x, headers[x])
            }
        }
        
        var scope = this;
        scope.$emit("http.request", getRequestEventData())
        
        
        return client[verb](url, data)
            .then(function (response) {
                scope.$emit("http.response", getResponseEventData(response))
                return response;
            })
            .catch((err) => {
                if (err.code === "ENOTFOUND") {
                    throw new Error("Unable to resolve host '" + err.hostname + "'")
                }
                throw err;
            });
    }
}

function isRange(start, end) {
    return function (response) {        
        var actual = response.statusCode
        if (actual < start || end < actual) {
            throw new Error("Expected code between " + start + " and " + end + ", actual: " + actual)
        }
    }
}

function isCode(code) {
    return function (response) {
        if (response.statusCode !== code) {
            throw new Error("Expected status code " + code + ", actual: " + response.statusCode)
        }
    }
}

function getJsonBody(response) {
    if (!response) return undefined
    
    try {
        return JSON.parse(response.body)
    }
    catch (err) {
        return response.body
    }
}