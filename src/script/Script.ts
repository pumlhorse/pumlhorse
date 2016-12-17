import { pumlhorse } from './PumlhorseGlobal';
import { ModuleLoader, ModuleLocator } from './ModuleLoader';
import { ScriptInterrupt } from './ScriptInterrupt';
import * as _ from 'underscore';
import * as Bluebird from 'bluebird';
import { IScriptDefinition } from './IScriptDefinition';
import { IScriptInternal } from './IScriptInternal';
import { Guid } from '../util/Guid';
import { IScript } from './IScript';
import { IScope } from './IScope';
import { Scope } from './Scope';
import { ModuleRepository } from './Modules';
import validateScriptDefinition from './scriptDefinitionValidator';
import * as loggers from './loggers';
import * as helpers from '../util/helpers';
import * as stringParser from './StringParser';
import * as Expression from 'angular-expressions';
import './modules/assert';
import './modules/async';
import './modules/conditional';
import './modules/http';

/* Load default modules */
pumlhorse.module('log')
    .function('log', loggers.log)
    .function('warn', loggers.warn)
    .function('error', loggers.error);

export class Script implements IScript {
    id: string;
    
    private internalScript: IScriptInternal;

    constructor(private scriptDefinition: IScriptDefinition) {

        validateScriptDefinition(this.scriptDefinition);

        this.id = new Guid().value;
        this.internalScript = new InternalScript(this.id);

        this.loadModules();
        this.loadFunctions();
        this.loadCleanupSteps();
    }

    async run(context?: any): Promise<any> {
        const scope = new Scope(this.internalScript, context);
        
        try {
            return await this.internalScript.runSteps(this.scriptDefinition.steps, scope);
        }
        catch (e) {
            if (e instanceof ScriptInterrupt) {
                return Promise.resolve({});
            }
            throw e;
        }
        finally {
            await this.runCleanupTasks(scope);
        }
    }

    addFunction(name: string, func: Function): void {
        this.internalScript.functions[name] = func;
    }

    addModule(moduleDescriptor: string) {
        const moduleLocator = ModuleLoader.getModuleLocator(moduleDescriptor);

        const mod = ModuleRepository.lookup[moduleLocator.name];
        if (mod == null) throw new Error(`Module "${moduleLocator.name}" does not exist`);

        if (moduleLocator.hasNamespace) {
            helpers.assignObjectByString(this.internalScript.modules, moduleLocator.namespace, mod);
        }
        else {
            _.extend(this.internalScript.modules, mod);
        }
    }

    private static readonly DefaultModules = ['log', 'assert', 'async', 'conditional'];
    private loadModules() {
        let modules = Script.DefaultModules.concat(this.scriptDefinition.modules == null
            ? []
            : this.scriptDefinition.modules)
        
        modules.forEach(def => this.addModule(def));
    }

    private loadFunctions() {
        if (this.scriptDefinition.functions == null) {
            return;
        }
        _.mapObject(this.scriptDefinition.functions, (name, def) => this.addFunction(name, new Function(def)));
    }

    private loadCleanupSteps() {
        if (this.scriptDefinition.cleanup == null) {
            return;
        }
        this.scriptDefinition.cleanup.map((step) => this.internalScript.cleanup.push(step));
    }

    private async runCleanupTasks(scope: Scope): Promise<any> {
        if (this.internalScript.cleanup == null) {
            return;
        }

        return await Promise.all(this.internalScript.cleanup.map(task => {
            try {
                return this.internalScript.runSteps([task], scope);
            }
            catch (e) {
                loggers.error(`Error in cleanup task: ${e.message}`);
                return Promise.resolve({});
            }
        }));
    }
}

class InternalScript implements IScriptInternal {
    id: string;
    modules: any[];
    functions: any[];
    steps: any[];
    cleanup: any[];

    constructor(id: string) {
        this.id = id;
        this.modules = [];
        this.functions = [];
        this.steps = [];
        this.cleanup = [];

    }

    emit(eventName: string, eventInfo: any): void {

    }

    addCleanupTask(task: any, atEnd?: boolean): void {
        if (atEnd) this.cleanup.push(task);
        else this.cleanup.splice(0, 0, task);
    }

    getModule(moduleName: string): any {
        return this.modules[moduleName];
    }

    async runSteps(steps: any[], scope: IScope): Promise<any> {
        if (steps == null || steps.length == 0) {
            loggers.warn('Script does not contain any steps');
        }

        _.extend(scope, this.modules, this.functions);

        return await Bluebird.mapSeries(steps, step => this.runStep(step, scope));
    }

    private async runStep(stepDefinition: any, scope: IScope) {

        if (_.isFunction(stepDefinition)) {
            // If we programatically added a function as a step, just shortcut and run it
            stepDefinition.call(scope);
            return;
        }

        let step: Step;
        if (_.isString(stepDefinition)) {
            step = new Step(stepDefinition, null, scope);
        }
        else {
            var functionName = _.keys(stepDefinition)[0];
            step = new Step(functionName, stepDefinition[functionName], scope);
        }

        return await step.run();
    }

}

const assignmentRegex = /([a-zA-Z0-9_-]+) = (.+)/;

class Step {
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

        return await this.runComplexStep();
    }

    // Run a step that does not contain any parameters
    private async runSimpleStep() {
        return await doEval(this.functionName, true, this.scope);
    }

    private async runComplexStep() {
        var evalParameters = null;
        if (this.parameters != null) {
            if (_.isArray(this.parameters)) evalParameters = this.parameters.map(p => this.compileParameter(p))
            else if (_.isString(this.parameters)) evalParameters = this.compileParameter(this.parameters)
            else if (_.isObject(this.parameters)) evalParameters = _.mapObject(this.parameters, (value, key) => this.compileParameter(value, key))
            else evalParameters = this.compileParameter(this.parameters)
        }

        var functionParameterNames = helpers.getParameters(this.runFunc);

        const aliases = StepFunction.getAliases(this.runFunc);
        var params = await Bluebird.mapSeries(functionParameterNames, 
                (name) => this.getParameter(evalParameters, name, aliases));
        
        let passedParams;
                            
        if (evalParameters === null) passedParams = null;
        else if (helpers.isValueType(evalParameters)) passedParams = [evalParameters];
        else if (_.isString(evalParameters)) passedParams = [evalParameters];
        else if (_.isArray(evalParameters) && _.isArray(this.parameters)) passedParams = evalParameters;
        else if (_.isString(this.parameters) && _.isObject(evalParameters)) passedParams = [evalParameters];
        else passedParams = params.length > 0 ? params : [evalParameters];
                
        var result = await this.runFunc.apply(this.scope, passedParams);
        
        this.doAssignment(result);
        return;
    }

    private compileParameter(value, key?) {
        if (StepFunction.hasDeferredParameter(this.runFunc, key)) return value;
            
        return doEval(value, true, this.scope);
    }

    private getParameter(parameters: any, name: string, aliases: string[]): any {
        
        if (this.isParameterName('$scope', name, aliases)) return this.scope;        
        if (this.isParameterName('$all', name, aliases)) return parameters;

        let parameterValue = undefined;
        if (parameters != null) {
            parameterValue = parameters[name];
            if (parameterValue == null && aliases != null) {
                parameterValue = parameters[aliases[name]];
            }
        }

        return parameterValue;
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
        if (this['__deferEval'] == null) return false;
        return this['__deferEval'].indexOf(parameterName) > -1;
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