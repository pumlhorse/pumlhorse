"use strict";
var Profile = (function () {
    function Profile() {
        this.contexts = [];
        this.filters = [];
        this.include = [];
        this.isRecursive = false;
        this.isSynchronous = false;
        this.maxConcurrentFiles = null;
        this.modules = [];
        this.settings = null;
    }
    return Profile;
}());
exports.Profile = Profile;
//# sourceMappingURL=Profile.js.map