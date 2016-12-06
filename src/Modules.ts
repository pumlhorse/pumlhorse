import enforce from './enforce';
import * as helpers from './helpers';
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

    function(name: string, func: Function, options?: IFunctionOptions): ModuleBuilder {
        var f = new ModuleFunction(name, func, options == null ? {} : options);
        this.module[name] = f.declaration;

        return this;
    }

    export(): Object {
        return this.module;
    }
}

class ModuleFunction {
    declaration: Function;

    constructor(
        public name: string,
        declaration: Function | any[],
        options: IFunctionOptions) {
        enforce(name, 'name')
            .isNotNull()
            .isString();
        enforce(declaration, 'declaration').isNotNull();

        const funcParams = helpers.getParameters(declaration);
        let funcArray: any[];
        if (_.isFunction(declaration)) {
            funcArray = funcParams;
        }
        else if (_.isArray(declaration)) {
            //Function declaration is ['parameter1', 'parameter2', ..., Function]
            enforce(declaration).isNotEmptyArray();
            funcArray = declaration;
            declaration = funcArray.pop();
            enforce(declaration).isFunction('Final parameter in array must be a function');

            if (funcParams.length != funcArray.length) {
                throw new Error(`Parameter count mismatch between parameter and function declarations. Expected ${funcParams.length}, got ${funcArray.length}`);
            }
        }
        else {
            throw new Error(`Expected '${declaration}' to be a function or an array`);
        }

        this.declaration = <Function>declaration;
        this.declaration['__alias'] = _.object(funcParams, funcArray.map((s) => s.toString()));
        this.declaration['__deferEval'] = options.deferredParameters;
        this.declaration['__passAsObject'] = options.passAsObject;
    }
}

interface IFunctionOptions {
    passAsObject?: boolean;
    deferredParameters?: string[];
}