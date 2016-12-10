import { ScriptInterrupt } from './ScriptInterrupt';
import * as _ from 'underscore';
import * as Bluebird from 'bluebird';
import enforce from '../util/enforce';
import { Guid } from '../util/Guid';
import { IScope } from './IScope';
import { IScriptInternal } from './IScriptInternal';
import { ModuleRepository } from './Modules';

export class Scope implements IScope {

    $_: Object;

    $Promise: Object;

    constructor(private script: IScriptInternal,
        scope?: IScope) {
        this.$_ = _;
        this.$Promise = Bluebird;

        _.extend(this, scope);
    }

    $cleanup(task: any): void {
        this.script.addCleanupTask(task);
    }

    $cleanupAfter(task: any): void {
        this.script.addCleanupTask(task, true);
    }

    $emit(eventName: string, eventInfo: any): void {
        this.script.emit(eventName, eventInfo);
    }

    $end(): void {
        throw new ScriptInterrupt();
    }

    $module(moduleName: string): any {
        enforce(moduleName).isNotNull();

        const mod = ModuleRepository.lookup[moduleName];

        if (mod == null) {
            throw new Error(`Module '${moduleName}' has not been registered`);
        }

        return mod;
    }

    $new(scope?: IScope): IScope {
        return new Scope(this.script, _.extend({}, this, scope));
    }

    async $runSteps(steps: any[], scope: IScope) {
        return await this.script.runSteps(steps, scope);
    }

    $scriptId(): string {
        return this.script.id;
    }

    $id(): string {
        return new Guid().value;
    }
}