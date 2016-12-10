"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var ModuleLoader_1 = require("./ModuleLoader");
var ScriptInterrupt_1 = require("./ScriptInterrupt");
var _ = require("underscore");
var Bluebird = require("bluebird");
var Guid_1 = require("./Guid");
var Scope_1 = require("./Scope");
var Modules_1 = require("./Modules");
var scriptDefinitionValidator_1 = require("./scriptDefinitionValidator");
var loggers = require("./loggers");
var helpers = require("./helpers");
var stringParser = require("./StringParser");
var Expression = require("angular-expressions");
exports.pumlhorse = {
    module: Modules_1.ModuleRepository.addModule,
};
global['pumlhorse'] = exports.pumlhorse;
exports.pumlhorse.module('log')
    .function('log', loggers.log)
    .function('warn', loggers.warn)
    .function('error', loggers.error);
var Script = (function () {
    function Script(scriptDefinition) {
        this.scriptDefinition = scriptDefinition;
        scriptDefinitionValidator_1.default(this.scriptDefinition);
        this.id = new Guid_1.Guid().value;
        this.internalScript = new InternalScript(this.id);
        this.loadModules();
        this.loadFunctions();
        this.loadCleanupSteps();
    }
    Script.prototype.run = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var scope, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scope = new Scope_1.Scope(this.internalScript, context);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 6]);
                        return [4 /*yield*/, this.internalScript.runSteps(this.scriptDefinition.steps, scope)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_1 = _a.sent();
                        if (e_1 instanceof ScriptInterrupt_1.ScriptInterrupt) {
                            return [2 /*return*/, Promise.resolve({})];
                        }
                        throw e_1;
                    case 4: return [4 /*yield*/, this.runCleanupTasks(scope)];
                    case 5:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Script.prototype.addFunction = function (name, func) {
        this.internalScript.functions[name] = func;
    };
    Script.prototype.addModule = function (moduleDescriptor) {
        var moduleLocator = ModuleLoader_1.ModuleLoader.getModuleLocator(moduleDescriptor);
        var mod = Modules_1.ModuleRepository.lookup[moduleLocator.name];
        if (mod == null)
            throw new Error("Module \"" + moduleLocator.name + "\" does not exist");
        if (moduleLocator.hasNamespace) {
            helpers.assignObjectByString(this.internalScript.modules, moduleLocator.namespace, mod);
        }
        else {
            _.extend(this.internalScript.modules, mod);
        }
    };
    Script.prototype.loadModules = function () {
        var _this = this;
        var modules = Script.DefaultModules.concat(this.scriptDefinition.modules == null
            ? []
            : this.scriptDefinition.modules);
        modules.forEach(function (def) { return _this.addModule(def); });
    };
    Script.prototype.loadFunctions = function () {
        var _this = this;
        if (this.scriptDefinition.functions == null) {
            return;
        }
        _.mapObject(this.scriptDefinition.functions, function (name, def) { return _this.addFunction(name, new Function(def)); });
    };
    Script.prototype.loadCleanupSteps = function () {
        var _this = this;
        if (this.scriptDefinition.cleanup == null) {
            return;
        }
        this.scriptDefinition.cleanup.map(function (step) { return _this.internalScript.cleanup.push(step); });
    };
    Script.prototype.runCleanupTasks = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.internalScript.cleanup == null) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all(this.internalScript.cleanup.map(function (task) {
                                try {
                                    return _this.internalScript.runSteps([task], scope);
                                }
                                catch (e) {
                                    loggers.error("Error in cleanup task: " + e.message);
                                    return Promise.resolve({});
                                }
                            }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Script;
}());
Script.DefaultModules = ['log'];
exports.Script = Script;
var InternalScript = (function () {
    function InternalScript(id) {
        this.id = id;
        this.modules = [];
        this.functions = [];
        this.steps = [];
        this.cleanup = [];
    }
    InternalScript.prototype.emit = function (eventName, eventInfo) {
    };
    InternalScript.prototype.addCleanupTask = function (task, atEnd) {
        if (atEnd)
            this.cleanup.push(task);
        else
            this.cleanup.splice(0, 0, task);
    };
    InternalScript.prototype.getModule = function (moduleName) {
        return this.modules[moduleName];
    };
    InternalScript.prototype.runSteps = function (steps, scope) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (steps == null || steps.length == 0) {
                            loggers.warn('Script does not contain any steps');
                        }
                        _.extend(scope, this.modules, this.functions);
                        return [4 /*yield*/, Bluebird.mapSeries(steps, function (step) { return _this.runStep(step, scope); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    InternalScript.prototype.runStep = function (stepDefinition, scope) {
        return __awaiter(this, void 0, void 0, function () {
            var step, functionName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (_.isFunction(stepDefinition)) {
                            stepDefinition.call(scope);
                            return [2 /*return*/];
                        }
                        if (_.isString(stepDefinition)) {
                            step = new Step(stepDefinition, null, scope);
                        }
                        else {
                            functionName = _.keys(stepDefinition)[0];
                            step = new Step(functionName, stepDefinition[functionName], scope);
                        }
                        return [4 /*yield*/, step.run()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return InternalScript;
}());
var assignmentRegex = /([a-zA-Z0-9_-]+) = (.+)/;
var Step = (function () {
    function Step(funcName, parameters, scope) {
        this.parameters = parameters;
        this.scope = scope;
        var match = funcName.match(assignmentRegex);
        if (match == null) {
            this.assignment = null;
            this.functionName = funcName;
        }
        else {
            this.assignment = match[1];
            this.functionName = match[2];
        }
    }
    Step.prototype.isAssignment = function () {
        return this.assignment != null;
    };
    Step.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.isAssignment() && this.assignment.length == 0) {
                            throw new Error('Assignment statement must have a variable name');
                        }
                        this.runFunc = helpers.objectByString(this.scope, this.functionName);
                        if (!(this.runFunc == null))
                            return [3 /*break*/, 3];
                        if (!(this.parameters == null))
                            return [3 /*break*/, 2];
                        _a = this.doAssignment;
                        return [4 /*yield*/, this.runSimpleStep()];
                    case 1:
                        _a.apply(this, [_c.sent()]);
                        return [2 /*return*/];
                    case 2: throw new Error("Function \"" + this.functionName + "\" does not exist");
                    case 3: return [4 /*yield*/, this.runComplexStep()];
                    case 4: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    Step.prototype.runSimpleStep = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, doEval(this.functionName, true, this.scope)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Step.prototype.runComplexStep = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var evalParameters, functionParameterNames, params, passedParams, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        evalParameters = null;
                        if (this.parameters != null) {
                            if (_.isArray(this.parameters))
                                evalParameters = this.parameters.map(function (p) { return _this.compileParameter(p); });
                            else if (_.isString(this.parameters))
                                evalParameters = this.compileParameter(this.parameters);
                            else if (_.isObject(this.parameters))
                                evalParameters = _.mapObject(this.parameters, function (value, key) { return _this.compileParameter(value, key); });
                            else
                                evalParameters = this.compileParameter(this.parameters);
                        }
                        functionParameterNames = helpers.getParameters(this.runFunc);
                        return [4 /*yield*/, Bluebird.mapSeries(functionParameterNames, function (name) { return _this.getParameter(evalParameters, name, StepFunction.getAliases(_this.runFunc)); })];
                    case 1:
                        params = _a.sent();
                        if (evalParameters === null)
                            passedParams = null;
                        else if (StepFunction.passAsObject(this.runFunc))
                            passedParams = [evalParameters];
                        else if (helpers.isValueType(evalParameters))
                            passedParams = [evalParameters];
                        else if (_.isString(evalParameters))
                            passedParams = [evalParameters];
                        else if (_.isArray(evalParameters) && _.isArray(this.parameters))
                            passedParams = evalParameters;
                        else if (_.isString(this.parameters) && _.isObject(evalParameters))
                            passedParams = [evalParameters];
                        else
                            passedParams = params.length > 0 ? params : [evalParameters];
                        return [4 /*yield*/, this.runFunc.apply(this.scope, passedParams)];
                    case 2:
                        result = _a.sent();
                        this.doAssignment(result);
                        return [2 /*return*/];
                }
            });
        });
    };
    Step.prototype.compileParameter = function (value, key) {
        if (StepFunction.hasDeferredParameter(this.runFunc, key))
            return value;
        return doEval(value, true, this.scope);
    };
    Step.prototype.getParameter = function (parameters, name, aliases) {
        var parameterValue = undefined;
        if (parameters != null) {
            parameterValue = parameters[name];
            if (parameterValue == null && aliases != null) {
                parameterValue = parameters[aliases[name]];
            }
        }
        return parameterValue;
    };
    Step.prototype.doAssignment = function (result) {
        if (this.isAssignment()) {
            this.scope[this.assignment] = result;
            return result;
        }
        return result;
    };
    return Step;
}());
var StepFunction = (function () {
    function StepFunction() {
    }
    StepFunction.hasDeferredParameter = function (func, parameterName) {
        if (this['__deferEval'] == null)
            return false;
        return this['__deferEval'].indexOf(parameterName) > -1;
    };
    StepFunction.passAsObject = function (func) {
        return func['__passAsObject'];
    };
    StepFunction.getAliases = function (func) {
        return func['__alias'];
    };
    return StepFunction;
}());
function doEval(input, compile, scope) {
    if (input == null)
        return null;
    if (_.isString(input)) {
        var parts = stringParser.parse(input);
        parts = parts
            .map(function (p) {
            return compile == true && p.isTokenized
                ? Expression.compile(p.value.trim())(scope)
                : p.value;
        });
        return parts.length > 1
            ? parts.join("")
            : parts[0];
    }
    if (typeof input == "object") {
        return (input.constructor === Array)
            ? input.map(function (val) { return doEval(val, true, scope); })
            : _.mapObject(input, function (val) { return doEval(val, true, scope); });
    }
    return input;
}
//# sourceMappingURL=Script.js.map