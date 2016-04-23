var Promise = require("bluebird")
var fs = require("fs");
var YAML = require("pumlhorse-yamljs")
var recursiveReaddir = require("recursive-readdir")

function readAsYaml(path) {
    return new Promise(function (resolve, reject) {
        try{
            var result = YAML.parseFile(path)
            resolve(result)
        }
        catch (e) {
            reject(e)
        }
    })
}

function readAsJson(path) {
    return module.exports.readFile(path)
        .then(function (text) {
            return JSON.parse(text);
        })
}

module.exports = {
    readAsYaml: readAsYaml,
    readAsJson: readAsJson,
    readdirRecursive: Promise.promisify(recursiveReaddir)
}

/* Add standard fs functions */
var functions = [
    "readdir",
    "readFile",
    "stat"
]

functions.forEach(promisifyFunction)

function promisifyFunction(name) {
    module.exports[name] = Promise.promisify(fs[name])
}