export interface IScope {

    _cleanup(task: Function): void;

    _cleanupAfter(task: Function): void;

    _emit(eventName: string, eventInfo: any): void;

    _module(moduleName: string): any;

    _new(scope?: IScope): IScope;

    _runSteps(steps: any[], scope: IScope): Promise<any>;

    _id(): string;
    
    scriptId: string;

}

export interface IFullScope extends IScope {

    log(message: string);
    warn(message: string);
    error(message: string);
}