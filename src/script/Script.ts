import { Step } from './Step';
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
import './modules/assert';
import './modules/async';
import './modules/conditional';
import './modules/http';
import './modules/json';
import './modules/loop';
import './modules/misc';
import './modules/stats';
import './modules/timer';
import './modules/wait';


pumlhorse.module('log')
    .function('log', loggers.log)
    .function('warn', loggers.warn)
    .function('error', loggers.error);

export class Script implements IScript {
    id: string;
    name: string;
    
    private internalScript: IScriptInternal;

    private static readonly DefaultModules = ['log', 'assert', 'async', 'conditional', 'json', 'loop', 'misc', 'timer', 'wait'];
    public static readonly StandardModules = Script.DefaultModules.concat(['http', 'stats']);

    constructor(private scriptDefinition: IScriptDefinition) {

        validateScriptDefinition(this.scriptDefinition);

        this.id = new Guid().value;
        this.name = scriptDefinition.name;
        this.internalScript = new InternalScript(this.id);

    }

    async run(context?: any): Promise<any> {
        this.loadModules();

        this.loadFunctions();
        this.loadCleanupSteps();
        
        const scope = new Scope(this.internalScript, context);
        
        try {
            await this.internalScript.runSteps(this.scriptDefinition.steps, scope);
        }
        catch (e) {
            if (e instanceof ScriptInterrupt) {
                return;
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
        
        _.mapObject(this.scriptDefinition.functions, (def, name) => this.addFunction(name, this.createFunction(def)));
    }

    
    private createFunction(val) {
        
        if (_.isString(val)) return new Function(val)
        
        function construct(args) {
            function DeclaredFunction(): void {
                return Function.apply(this, args);
            }
            DeclaredFunction.prototype = Function.prototype;
            return new DeclaredFunction();
        }
        
        return construct(val)
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

        await Bluebird.mapSeries(steps, step => this.runStep(step, scope));
    }

    private async runStep(stepDefinition: any, scope: IScope) {

        if (_.isFunction(stepDefinition)) {
            // If we programatically added a function as a step, just shortcut and run it
            stepDefinition.call(scope);
            return;
        }

        let step: Step;
        const lineNumber = stepDefinition.getLineNumber == null ? null : stepDefinition.getLineNumber();
        if (_.isString(stepDefinition)) {
            step = new Step(stepDefinition, null, scope, lineNumber);
        }
        else {
            var functionName = _.keys(stepDefinition)[0];
            step = new Step(functionName, stepDefinition[functionName], scope, lineNumber);
        }

        await step.run();
    }
}