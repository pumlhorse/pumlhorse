import {ICancellationToken} from '../util/ICancellationToken';

export interface IScript {
    run(context: any, cancellationToken?: ICancellationToken): Promise<any>;

    addFunction(name: string, func: Function): void;

    addModule(moduleDescriptor: string | Object): void;

    id: string;
    name: string;
}