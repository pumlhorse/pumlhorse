var _ = require("underscore")
var helpers = require("./helpers")
var moduleLoader = require("./moduleLoader")

var _modules = {};
module.exports = {
    addModule: addModule,
    modules: _modules
}

function addModule(name) {
    
    var mod = {}
    _modules[name] = mod
    
    
    var moduleWrapper = {
        function: addFunction,
        asExport: function () { return mod }   
    }
    
    return moduleWrapper
    
    function addFunction(functionName, func, options) {
        
        var f = moduleLoader.createFunction(functionName, func, options)
        
        func = f.declaration
        func.__alias = f.aliases
        func.__passAsObject = f.passAsObject
        func.__deferEval = f.deferredParameters
        
        mod[functionName] = func
        
        return moduleWrapper
    }
}
