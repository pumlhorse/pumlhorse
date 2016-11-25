var path = require("path")
var commandLineArgs = require("command-line-args")
var _ = require("underscore")
var colors = require("colors")
var app = require("./app")
var loggers = require("./loggers")
var fs = require("./promiseFs")
var Promise = require("bluebird")

module.exports.run = run;

function run(args) {
    
    console.time("Total time")
    if (!args) args = []
    else args = args.slice(2)
         
    return buildProfile(args)
        .then(function (profile) {
            if (!profile) return;
            
            return app.runProfile(profile, new SessionOutput()) 
        })
        .catch(logError)
        .finally(function () {
            console.timeEnd("Total time")
        })  
}

function buildProfile(args) {
    var cli = commandLineArgs([
        {
            name: "filesOrDirs",
            defaultOption: true,
            multiple: true,
            type: String
        },
        {
            name: "context",
            alias: "c",
            multiple: true,
            type: String,
            defaultValue: []
        },
        {
            name: "recursive",
            alias: "r",
            type: Boolean
        },
        {
            name: "sync",
            type: Boolean
        },
        {
            name: "max-concurrent",
            type: Number
        },
        {
            name: "profile",
            alias: "p",
            type: String
        },
        {
            name: "version",
            alias: "v",
            type: Boolean
        }
    ])
    
    var argObj = cli.parse(args);
    
    if (argObj.version) {
        loggers.log("Pumlhorse: version " + require("../package.json").version)
        return Promise.resolve();
    }
    
    return Promise.resolve(argObj)
        .then(function () {
            return (argObj.profile ? readProfileFile(argObj.profile) : Promise.resolve({}))
                .then(function (profile) {
                    if (!profile.include && argObj.filesOrDirs == null) argObj.filesOrDirs = ["."]
                    profile.include = combine(profile.include, argObj.filesOrDirs)
                    profile.contexts = combine(profile.contexts, argObj.context)
                    profile.recursive = override(argObj.recursive, profile.recursive)
                    profile.synchronous = override(argObj.sync, profile.synchronous)
                    profile.maxConcurrent = override(argObj["max-concurrent"], profile.maxConcurrent)
                    
                    return profile
                })
                
            function combine(arr1, arr2) {
                if (!arr2) return arr1
                if (!arr1) return arr2
                
                return arr1.concat(arr2)
            }
            
            function override(overrideValue, currentValue) {
                return overrideValue != null && overrideValue != undefined 
                    ? overrideValue
                    : currentValue
            }
        })
}

function readProfileFile(filePath) {
    if (!filePath.endsWith(".pumlprofile")) throw new Error("Profile file must be .pumlprofile")
    
    var fullPath = path.resolve(filePath)
    return fs.stat(fullPath)
        .catch(function (err) {
            throw new Error("'" + filePath + "' does not exist")
        })
        .then(function (stat) {
            if (!stat.isFile()) throw new Error("'" + filePath + "' does not exist")
            return fullPath;
        })
        .then(fs.readAsYaml)
        .then(function (profile) {
            if (!profile) return profile;
            
            //Make files relative to profile path
            profile.include = makeRelative(profile.include)
            profile.modules = makeModulesRelative(profile.modules)
            profile.filters = makeRelative(profile.filters)
            profile.contexts = makeRelative(profile.contexts)
            return profile;
        })

    function makeRelative(array) {
        if (!array) return array
        
        return array.map(makeRelativePath)
    }

    function makeModulesRelative(modules) {
        if (modules == null) return modules

        return modules.map((m) => { 
            return {
                name: m.name,
                path: makeRelativePath(m.path)
            }
        })
    }
    
    function makeRelativePath(filename) {
        return path.resolve(path.dirname(filePath), filename.toString())
    }
}

function setColor(args, colorFunc) {
    args[0] = colorFunc(args[0])
    return args
}

app.setLoggers({
    log: function () { console.log.apply(console, arguments) },
    warn: function () { console.warn.apply(console, setColor(arguments, colors.yellow)) },
    error: function () { console.error.apply(console, setColor(arguments, colors.red)) }
})

function logError(err) {
    loggers.error(err.message ? err.message : err)
    throw err
}

function SessionOutput() {
    
    this.onSessionFinished = function (totalCount, failures) {
        if (totalCount == 0) {
            loggers.log("0 scripts run. No .puml files found")
        }
        else {
            
            loggers.log("%s scripts run, %s", 
                totalCount,
                failures == 0 
                    ? "0 failures"
                    : colors.red(failures + (failures == 1 ? " failure" : " failures")));
        }
    }
    
    var scriptLogs = {}
    this.onScriptPending = function (id, fileName, scriptName) {
        scriptLogs[id] = new BufferedLogger(scriptName)
    }
    this.onScriptFinished = function (id, err) {
        var logger = scriptLogs[id]
        if (err) {
            lineNumber = err.lineNumber ? "Line " + err.lineNumber + ": " : ""
            logger.log("error", lineNumber + (err.message ? err.message : err))
            logger.log("error", "SCRIPT FAILED")
        }
        scriptLogs[id].flush()
    }
    this.onLog = function (id, level, message) {
        scriptLogs[id].log(level, message)
    }
}

function BufferedLogger(scriptName) {
    var messages = []
    
    function loggerFunc(logger) {
        
        return function(message) {
            messages.push({
                message: message,
                logger: logger
            })
        }
    }
    
    this.flush = function() {
        if (messages.length > 0) {
            loggers.log("--------------\r\n## " + scriptName + " ##")
            messages.forEach(function (m) {
                m.logger(m.message)
            })
        }
    }
    var logger = {
        log: loggerFunc(loggers.log),
        warn: loggerFunc(loggers.warn),
        error: loggerFunc(loggers.error),
    }
    
    this.log = function (level, message) {
        var l = logger[level]
        if (!l) return;
        l(message)
    }
}