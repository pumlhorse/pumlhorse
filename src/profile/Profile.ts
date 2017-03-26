import { IProfile, ModuleDescriptor } from './IProfile';
export class Profile implements IProfile {
    contexts: string[];
    filters: string[];
    include: string[];
    isRecursive: boolean;
    maxConcurrentFiles?: number;
    modules: ModuleDescriptor[];
    settings?: Object;
    isVerbose: boolean;

    constructor() {
        this.contexts = [];
        this.filters = [];
        this.include = [];
        this.isRecursive = false;
        this.maxConcurrentFiles = null;
        this.modules = [];
        this.settings = null;
        this.isVerbose = false;
    }
}