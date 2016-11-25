module.exports = function(value, parameterName) {
    return new Enforcement(value, parameterName)
}

var _ = require("underscore")

function Enforcement(value, parameterName) {
    this.value = value
    this.parameterName = parameterName
}
Enforcement.prototype.isNotNull = isNotNull
Enforcement.prototype.isArray = isArray

function isNotNull() {
    if (this.value === undefined) throwError.call(this, "is required")
    if (this.value == null) throwError.call(this, "cannot be null")
    return this
}

function isArray() {
    if (!_.isArray(this.value)) throwError.call(this, "must be an array")
    return this
}

function throwError(message) {
    var prefix = this.parameterName == null
        ? "Parameter "
        : "Parameter '" + this.parameterName + "' "
    throw new Error(prefix + message)
}