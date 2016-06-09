var path = require("path")
var _ = require("underscore")
var requireFromPath = require("./requireFromPath")
var helpers = require("./helpers")
var i18n = require("./script.i18n")

module.exports = {
    load: loadModules,
    getModuleLocator: getModuleLocator,
    createFunction: createFunction
}

function loadModules(fileName, script) {
    
    if (!script.modules) return [];
    
    var scriptDir = path.dirname(fileName)
    return script.modules.map((mod) => resolveModule(mod, scriptDir))
}

function resolveModule(mod, directory) {
    var moduleLocator = getModuleLocator(mod)
    
    return requireFromPath(moduleLocator.path, directory)
}

function getModuleLocator(descriptor) {
    if (!descriptor) throw new Error("Module name is required")
        
        var moduleNamespace = '';
        var moduleName;
        var knownPath
        
        if (_.isString(descriptor)) {
            checkNamespace(descriptor)
        }
        else if (helpers.isObject(descriptor)) {
            var keys = Object.keys(descriptor)
            if (keys.length > 1) throw new Error(i18n.error.invalid_module_format_separate_items)
            
            knownPath = descriptor[keys[0]]
            checkNamespace(keys[0])
        }
        
        return new ModuleLocator(moduleName, moduleNamespace, knownPath)
        
        
        function checkNamespace(key) {
            if (key.indexOf('=') > -1) {
                var parts = key.split('=', 2)
                moduleNamespace = parts[0].trim();
                moduleName = parts[1].trim(); 
            }
            else {
                moduleName = key;
            }
        }
}

function ModuleLocator(name, namespace, knownPath) {
    this.name = name
    this.namespace = namespace
    this.path = knownPath ? knownPath : name
    this.hasNamespace = !!namespace
}

function createFunction(functionName, func, options) {
    
    if (!options) options = {}
    
    if (!functionName || !helpers.isString(functionName) ||
        functionName.length == 0) throw new Error("Function name is required")
    
    if (!func) throw new Error("Function declaration is required")
    
    var funcParams = helpers.getParameters(func)
    if (helpers.isFunction(func)) {
        funcArray = funcParams
    }
    else if (helpers.isArray(func)) {
        var funcArray = func;
        func = funcArray[funcArray.length - 1]
        funcArray = funcArray.slice(0, funcArray.length - 1)
        if (!helpers.isFunction(func)) {
            throw new Error("Final parameter in array must be a function")
        }
        
        if (funcParams.length != funcArray.length) {
            throw new Error("Parameter count mismatch between parameter and function declarations")
        }          
    } else {
        throw new Error("Expected " + func + " to be a function or an array")
    }
    
    return _.extend({}, 
        options, 
        {
            declaration: func,
            aliases: _.object(funcParams, funcArray.map(function (s) { return s.toString()}))
        })
}