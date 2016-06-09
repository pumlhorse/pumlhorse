module.exports = requireFromPath

function requireFromPath(moduleName, directory) {
    var oldPaths = module.paths
    
    if (directory) module.paths = module.constructor._nodeModulePaths(directory)
    
    if (moduleName.constructor === String && typeof moduleName !== "string") {
        moduleName = moduleName.toString()
    }
    
    try {
        return require(moduleName)
    }
    finally {
        module.paths = oldPaths
    }
}