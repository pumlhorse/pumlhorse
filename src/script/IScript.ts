export interface IScript {
    run(context: any): Promise<any>;

    addFunction(name: string, func: Function): void;

    addModule(moduleDescriptor: string): void;

    id: string;
}