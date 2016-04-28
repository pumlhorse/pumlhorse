var helpers = require("./helpers")
module.exports = {
    getSetting: getSetting,
    addSetting: addSetting
}

var _settings = {}

function getSetting(name) {
    return helpers.objectByString(_settings, name)
}

function addSetting(name, value) {
    helpers.assignObjectByString(_settings, name, value)
}