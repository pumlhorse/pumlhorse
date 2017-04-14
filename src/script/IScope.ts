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