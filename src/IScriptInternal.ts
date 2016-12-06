import { IScope } from './IScope';
import { IPromise } from './IPromise';
export interface IScriptInternal {
    modules: any[];
    functions: Function[];
    steps: any[];
    cleanup: any[];

    emit(eventName: string, eventInfo: any);

    addCleanupTask(task: any, atEnd?: boolean);

    getModule(moduleName: string): any;

    id: string;

    runSteps(steps: any[], scope: IScope): IPromise<any>;
}