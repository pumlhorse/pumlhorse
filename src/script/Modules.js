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
    ModuleBuilder.prototype.function = function (name, func) {
        var f = new ModuleFunction(name, func);
        this.module[name] = f.declaration;
        return this;
    };
    ModuleBuilder.prototype.export = function () {
        return this.module;
    };
    return ModuleBuilder;
}());
var AliasListKey = '__alias';
var DeferredListKey = '__deferEval';
var DeferredPrefix = '$deferred.';
var ModuleFunction = (function () {
    function ModuleFunction(name, declaration) {
        this.name = name;
        enforce_1.default(name, 'name')
            .isNotNull()
            .isString();
        enforce_1.default(declaration, 'declaration').isNotNull();
        var actualParams = helpers.getParameters(declaration);
        var funcArray;
        if (_.isFunction(declaration)) {
            funcArray = actualParams;
        }
        else if (_.isArray(declaration)) {
            enforce_1.default(declaration).isNotEmpty();
            funcArray = declaration;
            declaration = funcArray.pop();
            enforce_1.default(declaration).isFunction('Final parameter in array must be a function');
            if (actualParams.length != funcArray.length) {
                throw new Error("Parameter count mismatch between parameter and function declarations. Expected " + actualParams.length + ", got " + funcArray.length);
            }
        }
        else {
            throw new Error("Expected '" + declaration + "' to be a function or an array");
        }
        this.declaration = declaration;
        this.declaration[DeferredListKey] = [];
        this.declaration[AliasListKey] = {};
        for (var i in funcArray) {
            var alias = funcArray[i];
            var actual = actualParams[i];
            if (alias.startsWith(DeferredPrefix)) {
                alias = alias.substring(DeferredPrefix.length);
                this.declaration[DeferredListKey].push(alias);
            }
            this.declaration[AliasListKey][actual] = alias;
        }
    }
    return ModuleFunction;
}());
//# sourceMappingURL=Modules.js.map