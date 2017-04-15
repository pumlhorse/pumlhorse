export interface IProfile {
    contexts?: string[];
    filters?: string[];
    include?: string[];
    isRecursive?: boolean;
    maxConcurrentFiles?: number;
    modules?: ModuleDescriptor[];
    settings?: Object;
    isVerbose?: boolean;
}

export class ModuleDescriptor {
    name: string;
    path: string;
}