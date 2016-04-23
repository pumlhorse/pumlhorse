var http = require("http-client-factory")
var helpers = require("../helpers")


var verbs = ["get", "post", "put", "delete", "patch", "options", "head"]

var mod = pumlhorse.module("http")
verbs.forEach(function (v) {
    mod.function(v, getPassThrough(v))
})

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