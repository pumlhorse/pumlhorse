import { ScriptInterrupt } from './ScriptInterrupt';
import * as _ from 'underscore';
import * as Promise from 'bluebird';
import enforce from './enforce';
import { Guid } from './Guid';
import { IPromise } from './IPromise';
import { IScope } from './IScope';
import { IScriptInternal } from './IScriptInternal';

export class Scope implements IScope {

    $_: Object;

    $Promise: Object;

    constructor(private script: IScriptInternal,
        scope?: IScope) {
        this.$_ = _;
        this.$Promise = Promise;

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
        enforce(name).isNotNull();

        const mod = this.script.getModule(name);

        if (mod == null) {
            throw new Error(`Module '${moduleName} has not been registered`);
        }

        return mod;
    }

    $new(scope?: IScope): IScope {
        return new Scope(this.script, _.extend({}, this, scope));
    }

    $runSteps(steps: any[], scope: IScope): IPromise<any> {
        return this.script.runSteps(steps, scope);
    }

    $scriptId(): string {
        return this.script.id;
    }

    $id(): string {
        return new Guid().value;
    }
}