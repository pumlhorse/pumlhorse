module.exports = requireFromPath;

function requireFromPath(moduleName, directory) {
    const oldPaths = module.paths;
    
    if (directory) module.paths = module.constructor._nodeModulePaths(directory);
    
    if (moduleName.constructor === String && typeof moduleName !== "string") {
        moduleName = moduleName.toString()
    }
    
    try {
        return require(moduleName);
    }
    finally {
        module.paths = oldPaths;
    }
}

module.exports.resolve = function(moduleName, directory) {
    const oldPaths = module.paths;
    
    if (directory) module.paths = module.constructor._nodeModulePaths(directory);
    
    if (moduleName.constructor === String && typeof moduleName !== "string") {
        moduleName = moduleName.toString()
    }
    
    try {
        return require.resolve(moduleName);
    }
    finally {
        module.paths = oldPaths;
    }
}