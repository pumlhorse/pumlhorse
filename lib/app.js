var events = require("events")
var util = require("util")
var YAML = require("pumlhorse-yamljs")
var path = require("path")
var _ = require("underscore")
var Promise = require("bluebird")
var Queue = require("promise-queue")
var fs = require("./promiseFs")
var helpers = require("./helpers")
var loggers = require("./loggers")
var filters = require("./filters")
var Script = require("./script")
var i18n = require("./script.i18n")
var settings = require("./settings")
var requireFromPath = require("./requireFromPath")
var moduleLoader = require("./moduleLoader")
var enforce = require("./enforce")

module.exports = {
    runProfile: runProfile,
    loadModule: loadModule,
    load: load,
    setLoggers: loggers.setLoggers,
    SessionOutput: SessionOutput
}

Queue.configure(Promise)

function loadModule(module) {
    Script.addModule(module)
}

function load(scriptText) {
    return new Script(YAML.parse(scriptText));
}

var _defaultProfile = {
    include: ["."],
    contexts: [],
    synchronous: false,
    recursive: false,
}

function runProfile(profile, sessionOutput) {
    _.defaults(profile, _defaultProfile)
    
    loadGlobalModules()
    registerFilters()
    addSettings()
    
    var _context = null;
    var emitEvent = getEventEmitter()
    
    var scriptsRun = 0, scriptsFailed = 0 
    
    return filters.onSessionStarting()
        .then(function () {
            emitEvent(EVENT.SessionStart)
        })
        .then(buildContext)
        .then(listFiles)
        .then(filterFiles)
        .then(runFiles)
        .then(function (results) {
            scriptsRun = results.length
            scriptsFailed = _.where(results, {isSuccess: false}).length
            emitEvent(EVENT.SessionFinish, scriptsRun, scriptsFailed)
            return scriptsFailed == 0;
        })
        .finally(function () {
            return filters.onSessionFinished(scriptsRun, scriptsFailed)
        });
    
    function loadGlobalModules() {
        if (profile.modules == null) return

        enforce(profile.modules, "modules").isArray()
        profile.modules.forEach((m) => {
            require(m.path)
        })
    }

    function registerFilters() {
        if (!profile.filters) return;
        
        profile.filters.forEach(require)
    }
    
    function addSettings() {
        if (!profile.settings) return;
        
        _.mapObject(profile.settings, function (val, key) {
            settings.addSetting(key, val)
        })
    }
            
    function getEventEmitter() {
        var eventEmitter = new events.EventEmitter()
        
        addListener(EVENT.SessionStart, sessionOutput.onSessionStarted)
        addListener(EVENT.SessionFinish, sessionOutput.onSessionFinished)
        addListener(EVENT.ScriptPending, sessionOutput.onScriptPending)
        addListener(EVENT.ScriptStart, sessionOutput.onScriptStarted)
        addListener(EVENT.ScriptFinish, sessionOutput.onScriptFinished)
        addListener(EVENT.Log, sessionOutput.onLog)
        addListener(EVENT.StepStart, sessionOutput.onStepStarted)
        addListener(EVENT.StepFinish, sessionOutput.onStepFinished)
        addListener(EVENT.HttpSend, sessionOutput.onHttpSent)
        addListener(EVENT.HttpReceive, sessionOutput.onHttpReceived)
        
        return function () {
            return eventEmitter.emit.apply(eventEmitter, arguments)
        }
        
        function addListener(event, listener) {
            if (!listener) return;
            
            eventEmitter.on(event, listener)
        }
    }
        
    function buildContext() {
        var contexts = profile.contexts;
        if (!contexts || contexts.length == 0) {
            _context = {}
            return Promise.resolve({});
        } 
        
        return Promise.mapSeries(contexts, readContextFile)
            .then(function (contextObjects) {
                _context = _.extend.apply(_, contextObjects)
            })
        
        function readContextFile(filePath) {
            if (_.isObject(filePath)) return Promise.resolve(filePath)
            
            var isJson = filePath.endsWith(".json")
            var isYaml = filePath.endsWith(".yml") || filePath.endsWith(".yaml")
            if (!isJson && !isYaml) throw new Error("Context file must be .json or .yaml")
            
            var readFunc = isJson ? fs.readAsJson : fs.readAsYaml;
            var fullPath = path.resolve(filePath)
            return fs.stat(fullPath)
                .then(function (stat) {
                    if (!stat.isFile()) throw new Error("'" + filePath + "' does not exist")
                    return fullPath;
                })
                .catch(function (err) {
                    throw new Error("'" + filePath + "' does not exist")
                })
                .then(readFunc)
        }
    }

    function listFiles() {
        
        return Promise.map(profile.include, findFiles)
            .then(function (arr) {
                return _.union.apply(this, arr)
            })
            
        function findFiles(filename) {
            var fullPath = path.resolve(".", filename)
            var readdirFunc = profile.recursive ? fs.readdirRecursive : fs.readdir;
            return fs.stat(fullPath)
                .then(function (stat) {
                    if (stat.isDirectory()) 
                        return readdirFunc(fullPath)
                            .then(function (files) {
                                return files.map(function (file) {
                                    return path.resolve(fullPath, file)
                                })
                            })
                    if (stat.isFile()) return [fullPath]
                    throw new Error("'" + filename + "' is not a file or directory")
                })
                .catch(function (err) {
                    throw new Error("'" + filename + "' is not a file or directory")
                })
        }
    }

    function filterFiles(fileNames) {
        return _.filter(fileNames, function (name) {
            return name.toLowerCase().endsWith(".puml")
        })
    }
    
    function runFiles(fileNames) {
        var queue = new Queue(getMaxConcurrentFiles(profile), Infinity)
        
        return Promise.map(fileNames, function (fileName) {
            return queue.add(function () {
                return readFile(fileName)
                    .then(runScript)
            })
        })
    }

    function LoadedScript(script, filePath) {
        this.script = script;
        this.filePath = filePath;
        
        script.listen("http.request", (data) => {
            emitEvent(EVENT.HttpSend, script.id, data)
        })
        script.listen("http.response", (data) => {
            emitEvent(EVENT.HttpReceive, script.id, data)
        })
        emitEvent(EVENT.ScriptPending, script.id, filePath, script.name)
    }

    function readFile(fileName) {

        function buildScript(fileText) {
            var parsed = YAML.parse(fileText)
            return new LoadedScript(new Script(parsed), fileName)
        }
    
        return fs.readFile(path.resolve(fileName), "utf8")
            .then(buildScript)
    }

    function runScript(s) {
        emitEvent(EVENT.ScriptStart, s.script.id)
        return loadModules(s)
            .then(function () {
                s.script.addFunction("log", getLogger("log"))
                s.script.addFunction("warn", getLogger("warn"))
                s.script.addFunction("error", getLogger("error"))
                
                function getLogger(level) {
                    return function () {
                        var message = util.format.apply(util, arguments)
                        emitEvent(EVENT.Log, s.script.id, level, message)
                    }
                }
                var start = new Date();

                _context.__filename = s.filePath
                return s.script.run(_context)
                    .then(function () {
                        emitEvent(EVENT.ScriptFinish, s.script.id, null)
                        return { isSuccess: true }
                    })
                    .catch(function (err) {
                        emitEvent(EVENT.ScriptFinish, s.script.id, err)
                        return { isSuccess: false }
                    });
        });
        
        function loadModules(scriptObj) {
            if (profile.modules != null) {
                profile.modules.forEach((m) => {

                    scriptObj.script.addModule(m.name)
                })
            }
            moduleLoader.load(scriptObj.filePath, scriptObj.script)
            return Promise.resolve({})
        }
    }
}

var DEFAULT_QUEUE_SIZE = 15
function getMaxConcurrentFiles(profile) {
    if (profile.synchronous) return 1;
    
    return profile.maxConcurrentFiles ? profile.maxConcurrentFiles : DEFAULT_QUEUE_SIZE 
}

function SessionOutput() {
    this.onSessionStarted = noop
    this.onSessionFinished = noop
    this.onScriptPending = noop
    this.onScriptStarted = noop
    this.onScriptFinished = noop
    this.onLog = noop
    this.onStepStarted = noop
    this.onStepFinished = noop
    this.onHttpSent = noop
    this.onHttpReceived = noop
    
    function noop() {
        
    }
}

var EVENT = {
    SessionStart: "sessionStart",
    SessionFinish: "sessionFinish",
    ScriptPending: "scriptPending",
    ScriptStart: "scriptStart", 
    ScriptFinish: "scriptFinish",
    Log: "log", 
    StepStart: "stepStart", 
    StepFinish: "stepFinish",
    HttpSend: "httpSend",
    HttpReceive: "httpReceive" 
}