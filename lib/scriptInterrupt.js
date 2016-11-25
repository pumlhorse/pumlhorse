
module.exports = ScriptInterrupt;

function ScriptInterrupt() {
}
ScriptInterrupt.prototype = Object.create(Error.prototype);
ScriptInterrupt.prototype.constructor = ScriptInterrupt;