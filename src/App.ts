

import * as _ from 'underscore';
import { IApp } from './IApp';
import { IProfile } from './profile/IProfile';
import { Profile } from './profile/Profile';
import { ISessionOutput } from './profile/ISessionOutput';
import { ProfileRunner } from './profile/ProfileRunner';
import { IScript } from './script/IScript';
import { Script } from './script/Script';
import * as loggers from './script/loggers';
import {ICancellationToken} from './util/ICancellationToken';
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

    async runProfile(profile: IProfile, sessionOutput: ISessionOutput, cancellationToken?: ICancellationToken): Promise<any> {
        _.defaults(profile, this.defaultProfile);

        const runner = new ProfileRunner(profile, sessionOutput);

        return await runner.run(cancellationToken);
    }

    /* Obsolete */
    load(scriptDefinition: string): IScript {
        loggers.warn('Function "load" is obsolete. Use "getScript" instead');
        return this.getScript(scriptDefinition);
    }
}

