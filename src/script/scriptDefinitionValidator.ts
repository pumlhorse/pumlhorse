import * as _ from 'underscore';
import { IScriptDefinition } from './IScriptDefinition';
export default validate;

function validate(scriptDefinition: IScriptDefinition) {
    if (scriptDefinition.name == null) {
        throw new ScriptDefinitionValidationError('Property "name" is required');
    }

    if (scriptDefinition.modules != null && !_.isArray(scriptDefinition.modules)) {
        throw new ScriptDefinitionValidationError('Property "modules" must be an array');        
    }

    if (scriptDefinition.functions != null && !_.isObject(scriptDefinition.functions)) {
        throw new ScriptDefinitionValidationError('Property "functions" must be an object');        
    }

    if (scriptDefinition.steps != null && !_.isArray(scriptDefinition.steps)) {
        throw new ScriptDefinitionValidationError('Property "steps" must be an array');        
    }

    if (scriptDefinition.cleanup != null && !_.isArray(scriptDefinition.steps)) {
        throw new ScriptDefinitionValidationError('Property "cleanup" must be an array');        
    }


}

class ScriptDefinitionValidationError implements Error {

    name: 'Script Definition Validation Error';

    constructor(public message: string) {}
}