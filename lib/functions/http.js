var http = require("http-client-factory")
var helpers = require("../helpers")


var verbs = ["get", "post", "put", "delete", "patch", "options", "head"]

var mod = pumlhorse.module("http")
verbs.forEach(function (v) {
    mod.function(v, getPassThrough(v))
})
/* General purpose */
mod.function("isInformational", isRange(100, 199))
mod.function("isSuccess", isRange(200, 299))
mod.function("isRedirect", isRange(300, 399))
mod.function("isError", isRange(400, 599))
/* Specific error codes */
mod.function("isOk", isCode(200))
mod.function("isNotModified", isCode(304))
mod.function("isBadRequest", isCode(400))
mod.function("isUnauthorized", isCode(401))
mod.function("isForbidden", isCode(403))
mod.function("isNotFound", isCode(404))
mod.function("isNotAllowed", isCode(405))
/* Deserialization */
mod.function("body", getJsonBody)

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
            });
    }
}

function isRange(start, end) {
    return function () {
        var response = arguments[0]
        
        var actual = response.statusCode
        if (actual < start || end < actual) {
            throw new Error("Expected code between " + start + " and " + end + ", actual: " + actual)
        }
    }
}

function isCode(code) {
    return function () {
        var response = arguments[0]
        if (response.statusCode !== code) {
            throw new Error("Expected status code " + code + ", actual: " + response.statusCode)
        }
    }
}

function getJsonBody() {
    var response = arguments[0]
    
    if (!response) return undefined
    
    try {
        return JSON.parse(response.body)
    }
    catch (err) {
        return response.body
    }
}