import * as _ from 'underscore';
import enforce from '../util/enforce';
import { Guid } from '../util/Guid';
import { IScriptInternal } from './Script';
import { FunctionLookup, ModuleRepository } from './Modules';

export interface IScope {

    _cleanup(task: any): void;

    _cleanupAfter(task: any): void;

    _emit(eventName: string, eventInfo: any): void;

    _module(moduleName: string): any;

    _new(scope?: IScope): IScope;

    _runSteps(steps: any[], scope: IScope): Promise<any>;

    _id(): string;
    
    scriptId: string;

    __filename: string;
}

export class Scope implements IScope {

    scriptId: string;
    __filename: string;

    constructor(private script: IScriptInternal,
        scope?: IScope) {
        _.extend(this, scope);
        this.scriptId = script.id;
    }

    _cleanup(task: any): void {
        this.script.addCleanupTask(task);
    }

    _cleanupAfter(task: any): void {
        this.script.addCleanupTask(task, true);
    }

    _emit(eventName: string, eventInfo: any): void {
        this.script.emit(eventName, eventInfo);
    }

    _module(moduleName: string): FunctionLookup {
        enforce(moduleName).isNotNull();

        const mod = ModuleRepository.lookup[moduleName];

        if (mod == null) {
            throw new Error(`Module '${moduleName}' has not been registered`);
        }

        return mod.getFunctions();
    }

    _new(scope?: IScope): IScope {
        return new Scope(this.script, _.extend({}, this, scope));
    }

    async _runSteps(steps: any[], scope: IScope) {
        return await this.script.runSteps(steps, scope);
    }

    _id(): string {
        return new Guid().value;
    }

}