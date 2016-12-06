import { IPromise } from './IPromise';

export interface IScript {
    run(context: any): IPromise<any>;

    addFunction(name: string, func: Function): void;

    addModule(moduleDescriptor: string): void;

    id: string;
}