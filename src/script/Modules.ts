import enforce from '../util/enforce';
import * as helpers from '../util/helpers';
import * as _ from 'underscore';

export class ModuleRepository {
    static lookup: Object = {};

    static addModule(name: string): ModuleBuilder {
        var module = {};

        ModuleRepository.lookup[name] = module;

        return new ModuleBuilder(module);
    }
}

class ModuleBuilder {
    constructor(private module: any) {
    }

    function(name: string, func: Function | any[]): ModuleBuilder {
        var f = new ModuleFunction(name, func);
        this.module[name] = f.declaration;

        return this;
    }

    export(): Object {
        return this.module;
    }

    //Deprecated, added for backward compatibility
    asExport(): Object {
        return this.export();
    }
}

const AliasListKey = '__alias';
const DeferredListKey = '__deferEval';
const DeferredPrefix = '$deferred.';
class ModuleFunction {

    declaration: Function;

    constructor(
        public name: string,
        declaration: Function | any[]) {
        enforce(name, 'name')
            .isNotNull()
            .isString();
        enforce(declaration, 'declaration').isNotNull();

        const actualParams = helpers.getParameters(declaration);
        let funcArray: any[];
        if (_.isFunction(declaration)) {
            funcArray = actualParams;
        }   
        else if (_.isArray(declaration)) {
            //Function declaration is ['parameter1', 'parameter2', ..., Function]
            enforce(declaration).isNotEmpty();
            funcArray = <any[]>declaration;
            declaration = funcArray.pop();
            enforce(declaration).isFunction('Final parameter in array must be a function');

            if (actualParams.length != funcArray.length) {
                throw new Error(`Parameter count mismatch between parameter and function declarations. Expected ${actualParams.length}, got ${funcArray.length}`);
            }
        }
        else {
            throw new Error(`Expected '${declaration}' to be a function or an array`);
        }

        this.declaration = <Function>declaration;

        this.declaration[DeferredListKey] = [];
        this.declaration[AliasListKey] = {};

        for (var i in funcArray) {
            var alias = <string>funcArray[i];
            var actual = actualParams[i];

            if (alias.startsWith(DeferredPrefix)) {
                alias = alias.substring(DeferredPrefix.length);
                this.declaration[DeferredListKey].push(alias);
            }

            this.declaration[AliasListKey][actual] = alias;
        }
    }

}