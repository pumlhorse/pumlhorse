export interface IScriptDefinition {
    name: string;

    description?: string;

    modules?: any[];

    functions?: Object;

    expects?: string[];

    steps: any[];

    cleanup?: any[];
}