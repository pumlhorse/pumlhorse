import * as readline from 'readline';
import { IScope } from '../IScope';
import enforce from '../../util/enforce';
import { ScriptInterrupt } from '../ScriptInterrupt';
import { pumlhorse } from '../../PumlhorseGlobal';

export const promptInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var requireFromPath = require('../../../util/requireFromPath');

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

export function promptForValue(ask: string, forValue: string, $scope: IScope): Promise<string> {

    enforce(ask, 'ask').isString();
    enforce(forValue, 'for').isString();

    if (ask == null) {
        ask = forValue == null ? 'Enter value: ' : `Enter value for ${forValue}`;
    }

    return new Promise((resolve, reject) => 
    {
        if (forValue != null && $scope[forValue] != null) {
            resolve($scope[forValue]);
        }
        else {
            promptInterface.question(ask + '\n> ', (answer) => {
                $scope[forValue] = answer;
                resolve(answer);
            });
        }
    });
}

pumlhorse.module('misc')
    .function('end', end)
    .function('value', ['$all', (val) => val])
    .function('date', getDate)
    .function('import', importFunc)
    .function('convertText', convertText)
    .function('prompt', ['ask', 'for', '$scope', promptForValue]);