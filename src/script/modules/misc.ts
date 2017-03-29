import enforce from '../../util/enforce';
import { ScriptInterrupt } from '../ScriptInterrupt';
import { pumlhorse } from '../../PumlhorseGlobal';

const requireFromPath = require('../../../util/requireFromPath');

function importFunc(moduleName) {
    return requireFromPath(moduleName, this.__filename);
}

function end(): void {
    throw new ScriptInterrupt();
}

export function getDate(dt?: string): Date {
    if (dt == null) return new Date();
    return new Date(dt);
}

export function convertText(text: string, from: string, to: string) {
    enforce(text, 'text').isString().isNotNull();

    if (from == null) from = 'utf-8';
    if (to == null) to = 'utf-8';
    
    return new Buffer(text, from).toString(to);    
}

pumlhorse.module('misc')
    .function('end', end)
    .function('value', ['$all', (val) => val])
    .function('date', getDate)
    .function('import', importFunc)
    .function('convertText', convertText);