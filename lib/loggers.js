module.exports = {
    setLoggers: setLoggers,
    log: function () { _loggers.log.apply(this, arguments) },
    warn: function () { _loggers.warn.apply(this, arguments) },
    error: function () { _loggers.error.apply(this, arguments) }
}

var _loggers

function setLoggers(loggerObj) {
    _loggers = loggerObj
}
setLoggers({
    log: function () { console.log.apply(console, arguments) },
    warn: function () { console.warn.apply(console, arguments) },
    error: function () { console.error.apply(console, arguments) }
})
