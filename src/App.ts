

import * as _ from 'underscore';
import { IApp } from './IApp';
import { IProfile } from './Profile/IProfile';
import { Profile } from './Profile/Profile';
import { ISessionOutput } from './Profile/ISessionOutput';
import { ProfileRunner } from './Profile/ProfileRunner';
import { IScript } from './Script/IScript';
import { Script } from './Script/Script';
import * as loggers from './Script/loggers';
const YAML = require('pumlhorse-yamljs');

export class App implements IApp {

    private defaultProfile: IProfile;

    constructor() {
        this.defaultProfile = new Profile();
        this.defaultProfile.include = ['.'];
    }

    getScript(scriptText: string): IScript {
        const scriptDefinition = YAML.parse(scriptText);
        return new Script(scriptDefinition);
    }

    async runProfile(profile: IProfile, sessionOutput: ISessionOutput): Promise<any> {
        _.defaults(profile, this.defaultProfile);

        const runner = new ProfileRunner(profile, sessionOutput);

        return await runner.run();
    }

    /* Obsolete */
    load(scriptDefinition: string): IScript {
        loggers.warn('Function "load" is obsolete. Use "getScript" instead');
        return this.getScript(scriptDefinition);
    }
}

