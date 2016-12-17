"use strict";
var _ = require("underscore");
function default_1(value, parameterName) {
    return new Enforcement(value, parameterName);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var Enforcement = (function () {
    function Enforcement(value, parameterName) {
        this.value = value;
        this.parameterName = parameterName;
    }
    Enforcement.prototype.isNotNull = function () {
        if (this.value === undefined)
            this.throwError('is required');
        if (this.value == null)
            this.throwError('cannot be null');
        return this;
    };
    Enforcement.prototype.isArray = function () {
        if (this.value != null && !_.isArray(this.value))
            this.throwError('must be an array');
        return this;
    };
    Enforcement.prototype.isNotEmpty = function () {
        if (this.value.length == 0)
            this.throwError('cannot be empty');
        return this;
    };
    Enforcement.prototype.isString = function () {
        if (this.value != null && !_.isString(this.value))
            this.throwError('must be a string');
        return this;
    };
    Enforcement.prototype.isFunction = function (overrideMessage) {
        if (this.value != null && !_.isFunction(this.value))
            this.throwError('must be a function', overrideMessage);
        return this;
    };
    Enforcement.prototype.throwError = function (message, overrideMessage) {
        if (overrideMessage != null)
            throw new Error(overrideMessage);
        var prefix = this.parameterName == null
            ? 'Parameter '
            : "Parameter \"" + this.parameterName + "\" ";
        throw new Error(prefix + message);
    };
    return Enforcement;
}());
//# sourceMappingURL=enforce.js.map