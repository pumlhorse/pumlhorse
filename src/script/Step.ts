import { Injector, InjectorLookup } from './Modules';
import { CancellationToken } from '../util/CancellationToken';
import { ScriptError } from './ScriptError';
import * as _ from 'underscore';
import * as Expression from 'angular-expressions';
import * as helpers from '../util/helpers';
import * as stringParser from './StringParser';
import { ICancellationToken } from '../util/CancellationToken';
import { IScope } from "./Scope";

const assignmentRegex = /([a-zA-Z0-9_-]+) = (.+)/;

export class Step {
    assignment: string;
    functionName: string;
    private runFunc: Function;

    constructor(funcName: string, 
        private parameters: any,
        private scope: IScope,
        private injectors: InjectorLookup = {},
        private lineNumber?: number) {
        const match = funcName.match(assignmentRegex);

        if (match == null) {
            this.assignment = null;
            this.functionName = funcName;
        }
        else {
            this.assignment = match[1];
            this.functionName = match[2];
        }

        this.injectors['$scope'] = () => scope;
    }

    private isAssignment(): boolean {
        return this.assignment != null;
    }

    async run(cancellationToken?: ICancellationToken) {
        if (this.isAssignment() && this.assignment.length == 0) {
            throw new Error('Assignment statement must have a variable name');
        }

        this.runFunc = helpers.objectByString<Function>(this.scope, this.functionName);

        if (this.runFunc == null || !_.isFunction(this.runFunc)) {
            if (this.parameters == null) {
                this.doAssignment(await this.runSimpleStep());
                return;
            }

            throw new ScriptError(new Error(`Function "${this.functionName}" does not exist`), this.lineNumber);
        }

        await this.runComplexStep(cancellationToken);
    }

    // Run a step that does not contain any parameters
    private async runSimpleStep() {
        try {
            return await doEval(this.functionName, true, this.scope);
        }
        catch (err) {
            throw new ScriptError(err, this.lineNumber);
        }
    }

    private async runComplexStep(cancellationToken: ICancellationToken) {
        
        const params = this.getParameterList(cancellationToken); 
        
        try {
            const result = await this.runFunc.apply(this.scope, params);
            this.doAssignment(result);
            return;
        }
        catch (err) {
            throw new ScriptError(err, this.lineNumber);
        }
        
    }

    private getParameterList(cancellationToken): any[] {
        const definedParameterNames = helpers.getParameters(this.runFunc);

        if (definedParameterNames.length == 0) {
            return [this.evaluateParameter(this.parameters, null)];
        }

        const aliases = StepFunction.getAliases(this.runFunc);
        const params = _.map(definedParameterNames, (name, i) => this.getParameter(name, aliases, i, cancellationToken));
        
        return params;
    }

    private getParameter(name: string, aliases: string[], index: number, cancellationToken: ICancellationToken): any {
        
        this.injectors['$all'] = () => this.evaluateParameter(this.parameters, name);
        this.injectors['$cancellationToken'] = () => cancellationToken == null ? CancellationToken.None : cancellationToken;

        const injector = this.getInjector(name, aliases);

        if (injector != null) {
            return injector(this.scope);
        }

        let parameterValue = undefined;
        if (index == 0 && 
            (_.isArray(this.parameters) || helpers.isValueType(this.parameters))) {
            return this.evaluateParameter(this.parameters, name)
        }
        else if (this.parameters != null && 
            _.isObject(this.parameters)) {
            parameterValue = this.parameters[name];
            if (parameterValue == null && aliases != null) {
                parameterValue = this.parameters[aliases[name]];
            }
        }

        return parameterValue == undefined
            ? undefined
            : this.evaluateParameter(parameterValue, name);
    }

    private getInjector(name: string, aliases: string[] = []): Injector {
        return this.injectors[name] || this.injectors[aliases[name]];
    }

    private evaluateParameter(value, name) {
        if (StepFunction.hasDeferredParameter(this.runFunc, name)) return value;
            
        return doEval(value, true, this.scope);
    }

    private doAssignment(result: any) {
        if (this.isAssignment()) {
            this.scope[this.assignment] = result;
            return result;
        }
        return result;
    }
}



class StepFunction {
    static hasDeferredParameter(func: Function, parameterName: string) : boolean {
        if (func['__deferEval'] == null) return false;
        return func['__deferEval'].indexOf(parameterName) > -1;
    }

    static getAliases(func: Function): string[] {
        return func['__alias'];
    }
}

function doEval(input: any, compile: boolean, scope: any): any {
    if (input == null) return null;
        
    if (_.isString(input)) {
        let parts = stringParser.parse(input)
        parts = _.map(parts, 
            (p) => {
                if (!compile || !p.isTokenized) return p.value;

                const val = Expression.compile(p.value.trim())(scope);
                return val instanceof String
                    ? val.toString() //Transform to a normal string
                    : val;
            })
        return parts.length > 1 
            ? parts.join("")
            : parts[0]
    }
    
    if (typeof input == "object") {
        return (input.constructor === Array)
            ? _.map(input, function (val) { return doEval(val, true, scope) })
            : _.mapObject(input, (val) => doEval(val, true, scope));
    }
    
    return input;
}