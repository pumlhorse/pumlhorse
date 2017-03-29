import { IScope } from './IScope';
import enforce from '../util/enforce';
import * as helpers from '../util/helpers';
import * as _ from 'underscore';

export class ModuleRepository {
    static lookup: {[name: string]: Module} = {};

    static addModule(name: string): ModuleBuilder {
        const module = new Module();

        ModuleRepository.lookup[name] = module;

        return new ModuleBuilder(module);
    }
}

export type Injector = ($scope: IScope) => any;
export type InjectorLookup = {[name: string]: Injector};
export type FunctionLookup = {[name: string]: Function};

export class Module {
    private injectors: InjectorLookup = {};
    private functions: FunctionLookup = {};

    getInjectors(): InjectorLookup {
        return this.injectors;
    }

    addInjector(name: string, injector: Injector) {
        enforce(name, 'name').isNotNull().isString();
        enforce(injector, 'injector').isNotNull().isFunction();

        this.injectors[name] = injector;
    }

    getFunctions(): FunctionLookup {
        return this.functions;
    }

    addFunction(name: string, func: Function) {
        enforce(name, 'name').isNotNull().isString();
        enforce(func, 'func').isNotNull().isFunction();
        
        this.functions[name] = func;
    }
}

export class ModuleBuilder {
    constructor(private module: Module) {
    }

    function(name: string, func: Function | any[]): ModuleBuilder {
        const f = new ModuleFunction(name, func);
        this.module.addFunction(name, f.declaration);

        return this;
    }

    injector(name: string, func: ($scope: IScope) => void): ModuleBuilder {
        this.module.addInjector(name, func);

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

        for (let i = 0; i < funcArray.length; i++) {
            let alias = <string>funcArray[i];
            const actual = actualParams[i];

            if (alias.startsWith(DeferredPrefix)) {
                alias = alias.substring(DeferredPrefix.length);
                this.declaration[DeferredListKey].push(alias);
            }

            this.declaration[AliasListKey][actual] = alias;
        }
    }

}