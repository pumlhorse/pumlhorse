import { pumlhorse } from '../../PumlhorseGlobal';

var requireFromPath = require('../../util/requireFromPath');

function importFunc(moduleName) {
    return requireFromPath(moduleName, this.__filename);
}

pumlhorse.module('misc')
    .function('value', ['$all', (val) => val])
    .function('import', importFunc);