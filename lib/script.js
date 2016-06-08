var Expression = require("angular-expressions")
var Promise = require("bluebird")
var _ = require("underscore")
var i18n = require("./script.i18n.js")
var helpers = require("./helpers")
var loggers = require("./loggers")
var modules = require("./modules.js")
var moduleLoader = require("./moduleLoader")
var filters = require("./filters.js")
var EventEmitter = require("events")
var util = require("util")

global.pumlhorse = {
    module: modules.addModule,
    filter: filters.getFilterBuilder
};

require("./functions/loop")
require("./functions/http")
require("./functions/assert")
require("./functions/wait")
require("./functions/json")
require("./functions/timer")
require("./functions/misc")

function ScriptEventEmitter() {
    EventEmitter.call(this)
}
util.inherits(ScriptEventEmitter, EventEmitter)

//Constants
var assignmentRegex = /([a-zA-Z0-9_-]+) = (.+)/

function getScript(obj) {

    function useModule(descriptor) {
        
        var moduleLocator = moduleLoader.getModuleLocator(descriptor)
        
        var m = modules.modules[moduleLocator.name]
        if (!m) throw new Error("Module '" + moduleLocator.name + "' does not exist")
        
        if (moduleLocator.hasNamespace) {
            helpers.assignObjectByString(_functions, moduleLocator.namespace, m)
        }
        else {
           _.extend(_functions, m)
        }
        
        
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
    
    var _functions = {}
    var _events = new ScriptEventEmitter()
    var _scriptId = helpers.getUniqueId()
    
    function listenToEvent(eventName, handler) {
        _events.on(eventName, handler)
    }
    
    function emitEvent() {
        _events.emit.apply(_events, arguments)
    }

    function loadModules() {
        if (!obj.modules) return;
        
        obj.modules.forEach(useModule)
    }

    function runScript(context) {
        
        var isSuccess = false;
        return filters.onScriptStarting(obj)
            .then(runScriptInternal)
            .then(function () {
                isSuccess = true;
            })
            .finally(function () { 
                return filters.onScriptFinished(obj, isSuccess)
            })
        
        function runScriptInternal() {
            if (!obj.steps || obj.steps.length == 0) {
                loggers.warn(i18n.warning.script_does_not_contain_steps)
                return Promise.resolve();
            }
            
            if (!obj.cleanup) {
                obj.cleanup = [];
            }
            
            loadModules()
            
            function Scope() {
                this.$scriptId = function () { return _scriptId }
                this.$runSteps = function (steps, scope) {
                    if (!scope) scope = this;
                    return runSteps(steps, scope);
                }
                this.$emit = emitEvent;
                this.$cleanup = function (task) { 
                    obj.cleanup.push(task)
                };
                this.$new = function (stack) { 
                    return _.extend({}, this, stack)
                };
                this.$call = function (functionName) {
                    var func = helpers.objectByString(this, functionName)
                    
                    if (!func) throw new Error("Could not find function '" + functionName + "'")
                    return func.apply(this, _.rest(arguments))
                }
                this.$module = function (name) {
                    if (!name) throw new Error("Module name is required")
                    
                    var m = modules.modules[name]
                    if (!m) throw new Error("Module '" + name + "' has not been registered")
                    
                    return m;
                }
                this.$_ = _;
                this.$Promise = Promise
                
                _.extend(this, context, _functions)
            }
            
            var scope = new Scope();

            var mainException
            return runSteps(obj.steps, scope)
                .catch(function (e) {
                    mainException = e;
                })
                .finally(function () {
                    return runCleanupTasks(obj.cleanup, scope)
                        .finally(function () {
                            if (mainException) throw mainException;
                        })
                })
        }
    }
    
    function runCleanupTasks(tasks, scope) {
        if (!tasks) return Promise.resolve({});
        
        return Promise.all(tasks.map(function (task) {
            return runStep(task, scope)
                .catch(function (ex) {
                    loggers.error("Error in cleanup task: " + ex.message)
                })
        }))
    }
    
    function runSteps(steps, scope) {
        return Promise.mapSeries(steps, function (step) {
            return runStep(step, scope)
        })
    }

    var currentLineNumber = 0;
    function runStep(step, scope) {
        var _scope = scope;
        
        if (helpers.isFunction(step)) {
            return new Promise(function (res, rej) {
                res(step.call(scope));
            })
        }
        if (_.isString(step)) {
            return runFunction(step, null);
        }
        
        currentLineNumber = step.getLineNumber ? step.getLineNumber() : currentLineNumber
        var functionName = _.keys(step)[0];
        
        return runFunction(functionName, step[functionName])
            .catch(function (err) {
                err.lineNumber = currentLineNumber
                throw err;  
            })

        function runFunction(functionName, funcParameters) {
            
            var parts = getAssignment(functionName);

            var isAssignment = parts.length > 1;

            var doAssignment = function (result) { return result }
            if (isAssignment) {
                if (parts[0].length == 0) {
                    throw new Error(i18n.error.no_variable_specified);
                }

                functionName = parts[parts.length - 1];
                doAssignment = function (result) {
                    //Assign the result of this function to any assignment variables
                    for (var i = 0; i < parts.length - 1; i++) {
                        _scope[parts[i]] = result;
                    }
                    return result;
                }
            }

            var runFunc = helpers.objectByString(_functions, functionName);
            if (!runFunc) {
                if (!funcParameters) {
                    return Promise.resolve(doAssignment(doEval(functionName, true)))
                }
                return Promise.reject(new Error(i18n.error.run_function_does_not_exist.format(functionName)));
            }

            var evalParameters = null;
            if (funcParameters) {
                if (_.isArray(funcParameters)) evalParameters = funcParameters.map(compileParameter)
                else if (_.isString(funcParameters)) evalParameters = compileParameter(funcParameters)
                else if (helpers.isObject(funcParameters)) evalParameters = _.mapObject(funcParameters, compileParameter)
                else evalParameters = compileParameter(funcParameters)
            }
            
            var functionParameterNames = helpers.getParameters(runFunc);
                    
            return Promise.mapSeries(functionParameterNames, getParameter)
                .then(function (params) {
                    var passedParams;
                                        
                    if (evalParameters === null) passedParams = null
                    else if (runFunc.__passAsObject) passedParams = [evalParameters]
                    else if (helpers.isValueType(evalParameters)) passedParams = [evalParameters]
                    else if (_.isString(evalParameters)) passedParams = [evalParameters]
                    else if (_.isArray(evalParameters) && _.isArray(funcParameters)) passedParams = evalParameters
                    else if (_.isString(funcParameters) && _.isObject(evalParameters)) passedParams = [evalParameters]
                    else passedParams = params.length > 0 ? params : [evalParameters]
                    
                    var result = runFunc.apply(_scope, passedParams)
                    
                    if (result && result.then && typeof result.then === "function") return result.then(doAssignment)
                    
                    return doAssignment(result)
                })
                
            function getAssignment(name) {
                var match = name.match(assignmentRegex)
                if (match) return match.slice(1)
                return []
            }
            
            function compileParameter(value, key) {
                if (runFunc.__deferEval && 
                    runFunc.__deferEval.indexOf(key) > -1) return value
                    
                return doEval(value, true);
            }
            
            function getParameter(name) {
                var parameterValue = undefined;
                if (funcParameters) {
                    parameterValue = evalParameters[name];
                    if (!parameterValue && runFunc.__alias) {
                        parameterValue = evalParameters[runFunc.__alias[name]]
                    }
                }

                return Promise.resolve(parameterValue);
            }

            function stringify(arr) {
                return arr.map(function (x) {
                    if (x === undefined) return "undefined"
                    if (x === null) return "null"
                    if (_.isString(x)) return x
                    return JSON.stringify(x)
                }).join(', ')
            }
        }
        
        function doEval(input, compile) {

            function evalObject(obj) {
                var newObj = {};
                for (var x in obj) {
                    newObj[x] = doEval(obj[x], true);
                }

                return newObj;
            }

            var VARIABLE_REF = /^\$([a-zA-Z]([a-zA-Z0-9]*|[._]|\(.?\)|\[.+\])*)$/mg
            var MACRO_REF = /^\$\{([\s\S]+)\}$/mg
            var COMBINED_REGEX = /\$([a-zA-Z]([a-zA-Z0-9]*|[._]|\(.?\)|\[.+\])*)|\$\{([\s\S]+)\}/mg
            function evaluateString(str) {
                if (!str || !str.match) return str
                
                if (str.match(VARIABLE_REF)) return str.substr(1); //strip off $ character
                if (str.match(MACRO_REF)) return str.substr(2, str.length - 3);
                    
                return "\"" + str.replace(COMBINED_REGEX, "\" + $1$3 + \"") + "\""
            }

            if (input == null) return null;
            
            if (_.isString(input)) {
                var val = evaluateString(input)
                return compile ? Expression.compile(val)(_scope) : val;
            }
            
            if (typeof input == "object") {
                return (input.constructor === Array)
                    ? input.map(function (val) { return doEval(val, true) })
                    :  evalObject(input);
            }
            
            return input;
        }
    }

    
    pumlhorse.module("log")
        .function("log", loggers.log)
        .function("warn", loggers.warn)
        .function("error", loggers.error)
    useModule("log")
    useModule("loop")
    useModule("http = http")
    useModule("assert")
    useModule("wait")
    useModule("json")
    useModule("timer")
    useModule("misc")

    var declarations
    if (obj.functions) {
        declarations = _.mapObject(obj.functions, createFunction)
    }
    _.extend(_functions, declarations)
    
    function addFunction(name, func) {
        _functions[name] = func
    }
    
    function createFunction(val) {
        
        if (_.isString(val)) return new Function(val)
        
        function construct(args) {
            function DeclaredFunction() {
                return Function.apply(this, args);
            }
            DeclaredFunction.prototype = Function.prototype;
            return new DeclaredFunction();
        }
        
        return construct(val)
    }
    
    //Build this object
    _.extend(this, obj, {
        run: runScript,
        addFunction: addFunction,
        listen: listenToEvent,
        id: _scriptId,
        _functions: _functions
    })
}

module.exports = getScript

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}