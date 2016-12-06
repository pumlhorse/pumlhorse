export interface IProfile {
    contexts: Object[];
    filters: string[];
    include: string[];
    isRecursive: boolean;
    isSynchronous: boolean;
    maxConcurrentFiles?: number;
    modules: Module[];
    settings?: Object;
}

export class Module {
    name: string;
    path: string;
}