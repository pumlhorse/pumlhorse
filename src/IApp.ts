import { ISessionOutput } from './profile/ISessionOutput';
import { IProfile } from './profile/IProfile';
import { IScript } from './script/IScript';
export interface IApp {
    getScript(scriptDefinition: string): IScript;

    runProfile(profile: IProfile, sessionOutput: ISessionOutput): Promise<any>;
}