import { IProfile, Module } from './IProfile';
export class Profile implements IProfile {
    contexts: string[];
    filters: string[];
    include: string[];
    isRecursive: boolean;
    maxConcurrentFiles?: number;
    modules: Module[];
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