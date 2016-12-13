"use strict";
var enforce_1 = require("../util/enforce");
var helpers = require("../util/helpers");
var _ = require("underscore");
var ModuleRepository = (function () {
    function ModuleRepository() {
    }
    ModuleRepository.addModule = function (name) {
        var module = {};
        ModuleRepository.lookup[name] = module;
        return new ModuleBuilder(module);
    };
    return ModuleRepository;
}());
ModuleRepository.lookup = {};
exports.ModuleRepository = ModuleRepository;
var ModuleBuilder = (function () {
    function ModuleBuilder(module) {
        this.module = module;
    }
    ModuleBuilder.prototype.function = function (name, func, options) {
        var f = new ModuleFunction(name, func, options == null ? {} : options);
        this.module[name] = f.declaration;
        return this;
    };
    ModuleBuilder.prototype.export = function () {
        return this.module;
    };
    return ModuleBuilder;
}());
var ModuleFunction = (function () {
    function ModuleFunction(name, declaration, options) {
        this.name = name;
        enforce_1.default(name, 'name')
            .isNotNull()
            .isString();
        enforce_1.default(declaration, 'declaration').isNotNull();
        var funcParams = helpers.getParameters(declaration);
        var funcArray;
        if (_.isFunction(declaration)) {
            funcArray = funcParams;
        }
        else if (_.isArray(declaration)) {
            enforce_1.default(declaration).isNotEmptyArray();
            funcArray = declaration;
            declaration = funcArray.pop();
            enforce_1.default(declaration).isFunction('Final parameter in array must be a function');
            if (funcParams.length != funcArray.length) {
                throw new Error("Parameter count mismatch between parameter and function declarations. Expected " + funcParams.length + ", got " + funcArray.length);
            }
        }
        else {
            throw new Error("Expected '" + declaration + "' to be a function or an array");
        }
        this.declaration = declaration;
        this.declaration['__alias'] = _.object(funcParams, funcArray.map(function (s) { return s.toString(); }));
        this.declaration['__deferEval'] = options.deferredParameters;
        this.declaration['__passAsObject'] = options.passAsObject;
    }
    return ModuleFunction;
}());
//# sourceMappingURL=Modules.js.map