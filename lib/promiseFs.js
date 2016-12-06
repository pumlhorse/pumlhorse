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
    readdirRecursive: Promise.promisify(recursiveReaddir),
    readdir:Promise.promisify(fs.readdir),
    readFile: Promise.promisify(fs.readFile),
    stat: Promise.promisify(fs.stat)
}