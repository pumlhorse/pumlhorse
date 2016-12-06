import { ISessionOutput } from './ISessionOutput';
import { IPromise } from './IPromise';
import { IProfile } from './IProfile';
import { IScript } from './IScript';
export interface IApp {
    getScript(scriptDefinition: string): IScript;

    runProfile(profile: IProfile, sessionOutput: ISessionOutput): IPromise<any>;
}