import { IProfile, Module } from './IProfile';
export class Profile implements IProfile {
    contexts: string[];
    filters: string[];
    include: string[];
    isRecursive: boolean;
    isSynchronous: boolean;
    maxConcurrentFiles?: number;
    modules: Module[];
    settings?: Object;

    constructor() {
        this.contexts = [];
        this.filters = [];
        this.include = [];
        this.isRecursive = false;
        this.isSynchronous = false;
        this.maxConcurrentFiles = null;
        this.modules = [];
        this.settings = null;
    }
}