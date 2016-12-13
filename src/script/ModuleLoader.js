"use strict";
var path = require("path");
var _ = require("underscore");
var enforce_1 = require("../util/enforce");
var requireFromPath = require('../util/./requireFromPath');
var ModuleLoader = (function () {
    function ModuleLoader() {
    }
    ModuleLoader.load = function (fileName, script) {
        var _this = this;
        if (script.modules == null)
            return [];
        var scriptDir = path.dirname(fileName);
        return script.modules.map(function (mod) { return _this.resolveModule(mod, scriptDir); });
    };
    ModuleLoader.getModuleLocator = function (moduleDescriptor) {
        enforce_1.default(moduleDescriptor).isNotNull();
        if (_.isString(moduleDescriptor)) {
            return new ModuleLocator(moduleDescriptor);
        }
        else if (_.isObject(moduleDescriptor)) {
            var keys = Object.keys(moduleDescriptor);
            if (keys.length > 1)
                throw new Error('Invalid module format: each module must be a separate item');
            return new ModuleLocator(keys[0], moduleDescriptor[keys[0]]);
        }
        throw new Error('Invalid module format: must be a string or an object');
    };
    ModuleLoader.resolveModule = function (modDescriptor, directory) {
        var moduleLocator = this.getModuleLocator(modDescriptor);
        return requireFromPath(moduleLocator.path, directory);
    };
    return ModuleLoader;
}());
exports.ModuleLoader = ModuleLoader;
var ModuleLocator = (function () {
    function ModuleLocator(descriptor, knownPath) {
        if (descriptor.indexOf('=') > -1) {
            var parts = descriptor.split('=', 2);
            this.namespace = parts[0].trim();
            this.name = parts[1].trim();
        }
        else {
            this.name = descriptor;
        }
        this.path = knownPath == null ? this.name : knownPath;
        this.hasNamespace = this.namespace != null;
    }
    return ModuleLocator;
}());
exports.ModuleLocator = ModuleLocator;
//# sourceMappingURL=ModuleLoader.js.map