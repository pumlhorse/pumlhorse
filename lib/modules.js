var _ = require("underscore")
var helpers = require("./helpers")

var _modules = {};

function addModule(name) {
    
    var mod = {}
    _modules[name] = mod
    
    
    var moduleWrapper = {
        function: addFunction,
        asExport: function () { return mod }   
    }
    
    return moduleWrapper
    
    function addFunction(functionName, func, options) {
        if (!options) options = {}
        
        if (!functionName || !helpers.isString(functionName) ||
            functionName.length == 0) throw new Error("Function name is required")
        
        if (!func) throw new Error("Function declaration is required")
        
        if (helpers.isFunction(func)) {}
        else if (helpers.isArray(func)) {
            var funcArray = func;
            func = funcArray[funcArray.length - 1]
            funcArray = funcArray.slice(0, funcArray.length - 1)
            if (!helpers.isFunction(func)) {
                throw new Error("Final parameter in array must be a function")
            }
            var funcParams = helpers.getParameters(func);
            
            if (funcParams.length != funcArray.length) {
                throw new Error("Parameter count mismatch between parameter and function declarations")
            }
            
            func.__alias = _.object(funcParams, funcArray.map(function (s) { return s.toString()}))
            func.__deferEval = _.filter(funcArray, function (val) {
                return val instanceof DeferredParameter
            }).map(function (val) { return val.name })
                        
        } else {
            throw new Error("Expected " + func + " to be a function or an array")
        }
        
        func.__passAsObject = options.passAsObject
        
        mod[functionName] = func
        
        return moduleWrapper
    }
}

module.exports.addModule = addModule;
module.exports.modules = _modules


/* Deferred parameters */
function DeferredParameter(name) {
    this.name = name;
    this.length = name.length;
}
DeferredParameter.prototype = new String
DeferredParameter.prototype.toString = DeferredParameter.prototype.valueOf = function(){return this.name};

function deferParameter(name) {
    return new DeferredParameter(name);
}
module.exports.defer = deferParameter