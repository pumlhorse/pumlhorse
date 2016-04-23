var Promise = require("bluebird")
var _ = require("underscore")
var helpers = require("./helpers")

var EVENTS = {
    ScriptStarting: "onScriptStarting",
    ScriptFinished: "onScriptFinished",
    SessionStarting: "onSessionStarting",
    SessionFinished: "onSessionFinished"
}

module.exports = {
    getFilterBuilder: function () { return new FilterBuilder() },
    onScriptStarting: runStartingFilters(EVENTS.ScriptStarting),
    onScriptFinished: runFinishedFilters(EVENTS.ScriptFinished),
    onSessionStarting: runStartingFilters(EVENTS.SessionStarting),
    onSessionFinished: runFinishedFilters(EVENTS.SessionFinished),
    list: function () { return _filters }  
}

var _filters = {}

_.mapObject(EVENTS, function (event) {
    _filters[event] = []
    FilterBuilder.prototype[event] = setter(event)
})

function FilterBuilder() {
}

function setter(eventName) {
    return function (func) {
        if (!func) return;
        if (!helpers.isFunction(func)) throw new Error(eventName + " must be a function")
        
        _filters[eventName].push(Promise.method(func))
        return this
    }
}

function runStartingFilters(eventName) {
    return function () {
        var filterArgs = arguments
        return Promise.each(_filters[eventName], function (filter) {
            return filter.apply(this, filterArgs)
                .then(function (result) {
                    if (result === false) throw new Error("Function returned false")
                })
                .catch(function (err) {
                    throw new Error(eventName + " filter returned error. " + (err.message ? err.message : err))
                })
        })
    }
}

function runFinishedFilters(eventName) {
    return function () {
        var filterArgs = arguments
        if (_filters[eventName] == 0) return Promise.resolve()
        return Promise.each(_filters[eventName], function (filter) {
            return filter.apply(this, filterArgs)
        })
            .then(function () { return; })
            .catch(function () { return; })
    }
}