import { ILogger } from './script/loggers';


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

export class App implements IApp {

    private defaultProfile: IProfile;
    private logger: ILogger;

    constructor() {
        this.defaultProfile = new Profile();
        this.defaultProfile.include = ['.'];
        this.logger = loggers.getLogger();
    }

    getScript(scriptText: string): IScript {
        return Script.create(scriptText);
    }

    async runProfile(profile: IProfile, sessionOutput: ISessionOutput, cancellationToken?: ICancellationToken): Promise<any> {
        _.defaults(profile, this.defaultProfile);

        const runner = new ProfileRunner(profile, sessionOutput);

        return await runner.run(cancellationToken);
    }

    /* Obsolete */
    load(scriptDefinition: string): IScript {
        this.logger.warn('Function "load" is obsolete. Use "getScript" instead');
        return this.getScript(scriptDefinition);
    }
}

