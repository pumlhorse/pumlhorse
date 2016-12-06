import { IPromise } from './IPromise';
export interface IScope {

    $_: Object;

    $Promise: Object;

    $cleanup(task: Function): void;

    $cleanupAfter(task: Function): void;

    $emit(eventName: string, eventInfo: any): void;

    $end(): void;

    $module(moduleName: string): any;

    $new(scope?: IScope): IScope;

    $runSteps(steps: any[], scope: IScope): IPromise<any>;

    $scriptId(): string;

    $id(): string;

}