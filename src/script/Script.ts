import { ILogger, getLogger } from './loggers';
import { CancellationToken, ICancellationToken } from '../util/CancellationToken';
import { Step } from './Step';
import { ModuleLoader } from './ModuleLoader';
import * as _ from 'underscore';
import { Guid } from '../util/Guid';
import { InjectorLookup, Module, ModuleRepository } from './Modules';
import { IScope, Scope } from './Scope';
import validateScriptDefinition from './scriptDefinitionValidator';
import * as helpers from '../util/helpers';
import './modules/assert';
import './modules/async';
import './modules/conditional';
import './modules/http';
import './modules/json';
import './modules/loop';
import './modules/math';
import './modules/misc';
import './modules/stats';
import './modules/timer';
import './modules/wait';

const YAML = require('pumlhorse-yamljs');

class ScriptOptions {
    logger: ILogger;
}

export interface IScript {
    run(context: any, cancellationToken?: ICancellationToken): Promise<any>;

    addFunction(name: string, func: Function): void;

    addModule(moduleDescriptor: string | Object): void;

    id: string;
    name: string;
}

export interface IScriptDefinition {
    name: string;

    description?: string;

    modules?: any[];

    functions?: Object;

    expects?: string[];

    steps: any[];

    cleanup?: any[];
}

export class Script implements IScript {
    id: string;
    name: string;
    
    private internalScript: IScriptInternal;

    private static readonly DefaultModules = ['assert', 'async', 'conditional', 'json', 'loop', 'math', 'misc', 'timer', 'wait', 'http = http'];
    public static readonly StandardModules = Script.DefaultModules.concat(['stats']);

    constructor(private scriptDefinition: IScriptDefinition, private scriptOptions?: ScriptOptions) {
        validateScriptDefinition(this.scriptDefinition);

        this.id = new Guid().value;
        this.name = scriptDefinition.name;

        if (this.scriptOptions == null) {
            this.scriptOptions = new ScriptOptions();
        }

        if (this.scriptOptions.logger == null) {
            this.scriptOptions.logger = getLogger();
        }

        this.internalScript = new InternalScript(this.id, this.scriptOptions);
    }

    static create(scriptText: string, scriptOptions?: ScriptOptions): Script {
        const scriptDefinition = YAML.parse(scriptText);
        return new Script(scriptDefinition, scriptOptions);
    }

    async run(context?: any, cancellationToken?: ICancellationToken): Promise<any> {
        if (cancellationToken == null) cancellationToken = CancellationToken.None;
        
        this.evaluateExpectations(context);
        this.loadModules();

        this.loadFunctions();
        this.loadCleanupSteps();
        
        const scope = new Scope(this.internalScript, context);

        
        try {
            await this.internalScript.runSteps(this.scriptDefinition.steps, scope, cancellationToken);
            return scope;
        }
        finally {
            await this.runCleanupTasks(scope, cancellationToken);
        }
    }

    addFunction(name: string, func: Function): void {
        this.internalScript.functions[name] = func;
    }

    addModule(moduleDescriptor: string | Object) {
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

    private evaluateExpectations(context: any) {
        if (this.scriptDefinition.expects == null) return;

        const missingValues = _.difference(this.scriptDefinition.expects.map(m => m.toString()), _.keys(context));

        if (missingValues.length > 0) {
            throw new Error(missingValues.length > 1 
                ? `Expected values "${missingValues.join(', ')}", but they were not passed`
                : `Expected value "${missingValues[0]}", but it was not passed`)
        }
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

        this.addFunction('debug', (msg) => this.scriptOptions.logger.debug(msg));
        this.addFunction('log', (msg) => this.scriptOptions.logger.log(msg));
        this.addFunction('warn', (msg) => this.scriptOptions.logger.warn(msg));
        this.addFunction('error', (msg) => this.scriptOptions.logger.error(msg));

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

        for (let i = 0; i < this.internalScript.cleanup.length; i++) {
            const task = this.internalScript.cleanup[i];
            try {
                await this.internalScript.runSteps([task], scope, cancellationToken);
            }
            catch (e) {
                this.scriptOptions.logger.error(`Error in cleanup task: ${e.message}`);
            }
        }
    }
}

export interface IScriptInternal {
    modules: Module[];
    functions: {[name: string]: Function};
    injectors: InjectorLookup;
    steps: any[];
    cleanup: any[];

    emit(eventName: string, eventInfo: any);

    addCleanupTask(task: any, atEnd?: boolean);

    getModule(moduleName: string): any;

    id: string;

    runSteps(steps: any[], scope: IScope, cancellationToken?: ICancellationToken): Promise<any>;
}

class InternalScript implements IScriptInternal {
    id: string;
    modules: Module[];
    injectors: InjectorLookup;
    functions: {[name: string]: Function};
    steps: any[];
    cleanup: any[];
    private cancellationToken: ICancellationToken;
    private isEnded: boolean = false;

    constructor(id: string, private scriptOptions: ScriptOptions) {
        this.id = id;
        this.modules = [];
        this.injectors = {
            '$scope': (scope: IScope) => scope,
            '$logger': () => this.scriptOptions.logger
        };
        this.functions = {
            'end': () => { this.isEnded = true; }
        };
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
            this.scriptOptions.logger.warn('Script does not contain any steps');
            return;
        }

        _.extend(scope, this.modules, this.functions);

        for (let i = 0; i < steps.length; i++) {
            if (this.cancellationToken.isCancellationRequested || this.isEnded) {
                return;
            }
            await this.runStep(steps[i], scope);
        }
    }

    private async runStep(stepDefinition: any, scope: IScope) {

        if (_.isFunction(stepDefinition)) {
            // If we programatically added a function as a step, just shortcut and run it
            return stepDefinition.call(scope);
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