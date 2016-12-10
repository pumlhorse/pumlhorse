"use strict";
var uuid = require("uuid");
var Guid = (function () {
    function Guid() {
        this.value = uuid.v4();
    }
    return Guid;
}());
exports.Guid = Guid;
//# sourceMappingURL=Guid.js.map