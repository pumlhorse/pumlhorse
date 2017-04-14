import { InjectorLookup, Module } from './Modules';
import { IScope } from './IScope';
import {ICancellationToken} from '../util/ICancellationToken';

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