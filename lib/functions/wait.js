var Promise = require("bluebird")

function convertToMs(value, factor) {
    return value ? value * factor : 0
}

function waitFunc(milliseconds, seconds, minutes, hours) {
    
    var totalMs = convertToMs(milliseconds, 1) +
        convertToMs(seconds, 1000) +
        convertToMs(minutes, 1000 * 60) + 
        convertToMs(hours, 1000 * 60 * 60)
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve()
        }, totalMs)
    })
}

module.exports = pumlhorse.module("wait")
    .function("wait", waitFunc)
    .asExport()