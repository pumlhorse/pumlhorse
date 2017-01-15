export interface IProfile {
    contexts: string[];
    filters: string[];
    include: string[];
    isRecursive: boolean;
    maxConcurrentFiles?: number;
    modules: Module[];
    settings?: Object;
}

export class Module {
    name: string;
    path: string;
}