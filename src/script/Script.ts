import { CancellationToken } from '../util/CancellationToken';
import {ICancellationToken} from '../util/ICancellationToken';
import { Step } from './Step';
import { pumlhorse } from '../PumlhorseGlobal';
import { ModuleLoader } from './ModuleLoader';
import * as _ from 'underscore';
import { IScriptDefinition } from './IScriptDefinition';
import { IScriptInternal } from './IScriptInternal';
import { Guid } from '../util/Guid';
import { IScript } from './IScript';
import { IScope } from './IScope';
import { InjectorLookup, Module, ModuleRepository } from './Modules';
import { Scope } from './Scope';
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

    private static readonly DefaultModules = ['log', 'assert', 'async', 'conditional', 'json', 'loop', 'misc', 'timer', 'wait', 'http = http'];
    public static readonly StandardModules = Script.DefaultModules.concat(['stats']);

    constructor(private scriptDefinition: IScriptDefinition) {
        validateScriptDefinition(this.scriptDefinition);

        this.id = new Guid().value;
        this.name = scriptDefinition.name;
        this.internalScript = new InternalScript(this.id);

    }

    async run(context?: any, cancellationToken?: ICancellationToken): Promise<any> {
        if (cancellationToken == null) cancellationToken = CancellationToken.None;
        this.loadModules();

        this.loadFunctions();
        this.loadCleanupSteps();
        
        const scope = new Scope(this.internalScript, context);
        
        try {
            await this.internalScript.runSteps(this.scriptDefinition.steps, scope, cancellationToken);
        }
        catch (e) {
            if (e.__nonErrorScriptInterrupt == true) {
                return;
            }
            throw e;
        }
        finally {
            await this.runCleanupTasks(scope, cancellationToken);
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
            helpers.assignObjectByString(this.internalScript.modules, moduleLocator.namespace, mod.getFunctions());
        }
        else {
            _.extend(this.internalScript.modules, mod.getFunctions());
        }

        _.extend(this.internalScript.injectors, mod.getInjectors())
    }

    private loadModules() {
        const modules = Script.DefaultModules.concat(this.scriptDefinition.modules == null
            ? []
            : this.scriptDefinition.modules)
        
        for (let i = 0; i < modules.length; i++) {
            this.addModule(modules[i]);
        }
    }

    private loadFunctions() {
        const functions = this.scriptDefinition.functions;
        if (functions == null) {
            return;
        }
        
        for(let name in functions) {
            this.addFunction(name, this.createFunction(functions[name]));
        }
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
        
        for (let i = 0; i < this.scriptDefinition.cleanup.length; i++) {
            this.internalScript.cleanup.push(this.scriptDefinition.cleanup[i]);
        }
    }

    private async runCleanupTasks(scope: Scope, cancellationToken: ICancellationToken): Promise<any> {
        if (this.internalScript.cleanup == null) {
            return;
        }

        return await Promise.all(_.map(this.internalScript.cleanup, task => {
            try {
                return this.internalScript.runSteps([task], scope, cancellationToken);
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
    modules: Module[];
    injectors: InjectorLookup;
    functions: any[];
    steps: any[];
    cleanup: any[];
    private cancellationToken: ICancellationToken;

    constructor(id: string) {
        this.id = id;
        this.modules = [];
        this.injectors = {
            '$scope': (scope: IScope) => scope
        };
        this.functions = [];
        this.steps = [];
        this.cleanup = [];

    }

    emit(): void {

    }

    addCleanupTask(task: any, atEnd?: boolean): void {
        if (atEnd) this.cleanup.push(task);
        else this.cleanup.splice(0, 0, task);
    }

    getModule(moduleName: string): any {
        return this.modules[moduleName];
    }

    async runSteps(steps: any[], scope: IScope, cancellationToken: ICancellationToken): Promise<any> {
        if (cancellationToken != null) {
            this.cancellationToken = cancellationToken;
        }

        if (steps == null || steps.length == 0) {
            loggers.warn('Script does not contain any steps');
            return;
        }

        _.extend(scope, this.modules, this.functions);

        for (let i = 0; i < steps.length; i++) {
            if (this.cancellationToken.isCancellationRequested) {
                return;
            }
            await this.runStep(steps[i], scope);
        }
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
            step = new Step(stepDefinition, null, scope, this.injectors, lineNumber);
        }
        else {
            const functionName = _.keys(stepDefinition)[0];
            step = new Step(functionName, stepDefinition[functionName], scope, this.injectors, lineNumber);
        }

        await step.run(this.cancellationToken);
    }
}