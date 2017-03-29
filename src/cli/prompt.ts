import * as readline from 'readline';
import enforce from '../util/enforce';
import { IScope } from '../script/IScope';
import { pumlhorse } from '../PumlhorseGlobal';

pumlhorse.module('cliPrompt')
    .function('prompt', ['ask', 'for', '$scope', promptForValue]);

const promptInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export function promptForValue(ask: string, forValue: string, $scope: IScope): Promise<string> {

    enforce(ask, 'ask').isString();
    enforce(forValue, 'for').isString();

    if (ask == null) {
        ask = forValue == null ? 'Enter value: ' : `Enter value for ${forValue}`;
    }

    return new Promise((resolve) => 
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