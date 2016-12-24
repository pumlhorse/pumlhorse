import * as _ from 'underscore';
import * as Expression from 'angular-expressions';
import * as helpers from '../util/helpers';
import * as stringParser from './StringParser';

const assignmentRegex = /([a-zA-Z0-9_-]+) = (.+)/;

export class Step {
    assignment: string;
    functionName: string;
    private runFunc: Function;

    constructor(funcName: string, 
        private parameters: any,
        private scope) {
        const match = funcName.match(assignmentRegex);

        if (match == null) {
            this.assignment = null;
            this.functionName = funcName;
        }
        else {
            this.assignment = match[1];
            this.functionName = match[2];
        }
    }

    private isAssignment(): boolean {
        return this.assignment != null;
    }

    async run() {
        if (this.isAssignment() && this.assignment.length == 0) {
            throw new Error('Assignment statement must have a variable name');
        }

        this.runFunc = helpers.objectByString<Function>(this.scope, this.functionName);

        if (this.runFunc == null) {
            if (this.parameters == null) {
                this.doAssignment(await this.runSimpleStep());
                return;
            }

            throw new Error(`Function "${this.functionName}" does not exist`);
        }

        await this.runComplexStep();
    }

    // Run a step that does not contain any parameters
    private async runSimpleStep() {
        return await doEval(this.functionName, true, this.scope);
    }

    private async runComplexStep() {
        
        const params = this.getParameterList(); 
                
        var result = await this.runFunc.apply(this.scope, params);
        
        this.doAssignment(result);
        return;
    }

    private getParameterList(): any[] {
        var definedParameterNames = helpers.getParameters(this.runFunc);

        if (definedParameterNames.length == 0) {
            return [this.evaluateParameter(this.parameters)];
        }

        const aliases = StepFunction.getAliases(this.runFunc);
        var params = definedParameterNames.map((name, i) => this.getParameter(name, aliases, i));
        
        return params;
    }

    private getParameter(name: string, aliases: string[], index: number): any {
        
        if (this.isParameterName('$scope', name, aliases)) return this.scope;        
        if (this.isParameterName('$all', name, aliases)) {
            return this.evaluateParameter(this.parameters);
        }

        let parameterValue = undefined;
        if (index == 0 && 
            (_.isArray(this.parameters) || helpers.isValueType(this.parameters))) {
            return this.evaluateParameter(this.parameters)
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
            : this.evaluateParameter(parameterValue);
    }

    private evaluateParameter(value, key?) {
        if (StepFunction.hasDeferredParameter(this.runFunc, key)) return value;
            
        return doEval(value, true, this.scope);
    }

    private isParameterName(expectedName: string, actualName: string, aliases: string[]): boolean {
        return actualName == expectedName || (aliases != null && aliases[actualName] == expectedName)
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
        var parts = stringParser.parse(input)
        parts = parts
            .map((p) => {
                return compile == true && p.isTokenized
                    ? Expression.compile(p.value.trim())(scope)
                    : p.value
            })
        return parts.length > 1 
            ? parts.join("")
            : parts[0]
    }
    
    if (typeof input == "object") {
        return (input.constructor === Array)
            ? input.map(function (val) { return doEval(val, true, scope) })
            : _.mapObject(input, (val) => doEval(val, true, scope));
    }
    
    return input;
}