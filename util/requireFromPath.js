var path = require('path');
module.exports = requireFromPath;

function requireFromPath(moduleName, directory, alternativeDirectories) {

    if (moduleName[0] == '.') {
        return require(path.resolve(directory, moduleName));
    }

    const oldPaths = module.paths;
    
    if (directory) {
        let paths = module.constructor._nodeModulePaths(directory);

        addAlternativeDirectories(paths, alternativeDirectories);
        module.paths = paths;
    }
    
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
    
    if (directory) {
        let paths = module.constructor._nodeModulePaths(directory);

        addAlternativeDirectories(paths, alternativeDirectories);
        module.paths = paths;
    }
    
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

function addAlternativeDirectories(paths, alternativeDirectories) {
    if (alternativeDirectories == null) return;

    for (let i = paths.length - 1; i >= 0; i--) {
        const parentDir = paths[i].substr(0, paths[i].length - 12) //Remove 'node_modules'
        for (let j = alternativeDirectories.length - 1; j >= 0; j--) { //Respect order of alternativeDirectories
            paths.splice(i, 0, parentDir + alternativeDirectories[j])
        }
    }
}