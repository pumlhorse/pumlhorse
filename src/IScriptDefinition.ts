export interface IScriptDefinition {
    name: string;

    description?: string;

    modules?: any[];

    functions?: any[];

    steps: any[];

    cleanup?: any[];
}