import { IScriptDefinition } from './IScriptDefinition';
import * as path from 'path';
import * as _ from 'underscore';
import enforce from './enforce';

const requireFromPath = require('./requireFromPath');

export class ModuleLoader {

    static load(fileName: string, script: IScriptDefinition): any {
        if (script.modules == null) return [];

        const scriptDir = path.dirname(fileName);
        return script.modules.map((mod) => this.resolveModule(mod, scriptDir));
    }

    static getModuleLocator(moduleDescriptor: string): ModuleLocator {
        enforce(moduleDescriptor).isNotNull();

        if (_.isString(moduleDescriptor)) {
            return new ModuleLocator(moduleDescriptor);
        }
        else if (_.isObject(moduleDescriptor)) {
            const keys = Object.keys(moduleDescriptor);
            if (keys.length > 1) throw new Error('Invalid module format: each module must be a separate item');

            return new ModuleLocator(keys[0],moduleDescriptor[keys[0]]);
        }

        throw new Error('Invalid module format: must be a string or an object');
    }

    private static resolveModule(modDescriptor: any, directory: string): any {
        var moduleLocator = this.getModuleLocator(modDescriptor);

        return requireFromPath(moduleLocator.path, directory);
    }
}

export class ModuleLocator {
    readonly namespace: string;
    readonly name: string;
    readonly path: string;
    readonly hasNamespace: boolean;

    constructor(descriptor: string, knownPath?: string) {
        if (descriptor.indexOf('=') > -1) {
            const parts = descriptor.split('=', 2);
            this.namespace = parts[0].trim();
            this.name = parts[1].trim();
        }
        else {
            this.name = descriptor;
        }
        this.path = knownPath == null ? this.name : knownPath;
        this.hasNamespace = this.namespace != null;
    }
}