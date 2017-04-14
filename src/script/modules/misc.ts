import * as path from 'path';
import { ICancellationToken } from '../../../pumlhorse';
import enforce from '../../util/enforce';
import { pumlhorse } from '../../PumlhorseGlobal';
import { readAsYaml } from "../../util/asyncFs";
import { Script } from "../Script";
import { IScriptDefinition } from "../IScriptDefinition";
import { IScope } from "../IScope";

const requireFromPath = require('../../../util/requireFromPath');

function importFunc(moduleName) {
    return requireFromPath(moduleName, this.__filename);
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

const inheritedFunctions = ['log', 'warn', 'error'];
export async function runScript(script: string, withScope: any, $scope: IScope, $cancellationToken: ICancellationToken): Promise<any> {
    enforce(script, 'script').isString().isNotNull();
    enforce(withScope, 'with').isObject();

    const scriptObj = new Script(<IScriptDefinition>await readAsYaml(path.resolve(path.dirname($scope.__filename), script)));

    inheritedFunctions.forEach(f => scriptObj.addFunction(f, $scope[f]));

    const newScope = withScope == null
        ? $scope
        : $scope._new(withScope);

    return scriptObj.run(newScope, $cancellationToken);
}

pumlhorse.module('misc')
    .function('value', ['$all', (val) => val])
    .function('date', getDate)
    .function('import', importFunc)
    .function('convertText', convertText)
    .function('run', ['script', 'with', '$scope', '$cancellationToken', runScript]);