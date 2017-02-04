import { ScriptInterrupt } from '../ScriptInterrupt';
import { pumlhorse } from '../../PumlhorseGlobal';

var requireFromPath = require('../../../util/requireFromPath');

function importFunc(moduleName) {
    return requireFromPath(moduleName, this.__filename);
}

function end(): void {
    throw new ScriptInterrupt();
}

pumlhorse.module('misc')
    .function('end', end)
    .function('value', ['$all', (val) => val])
    .function('import', importFunc);