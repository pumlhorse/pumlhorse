export interface IScriptDefinition {
    name: string;

    description?: string;

    modules?: any[];

    functions?: Object;

    steps: any[];

    cleanup?: any[];
}