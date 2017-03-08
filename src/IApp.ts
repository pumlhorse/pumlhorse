import { ISessionOutput } from './profile/ISessionOutput';
import { IProfile } from './profile/IProfile';
import { IScript } from './script/IScript';
import {ICancellationToken} from './util/ICancellationToken';

export interface IApp {
    getScript(scriptDefinition: string): IScript;

    runProfile(profile: IProfile, sessionOutput: ISessionOutput, cancellationToken?: ICancellationToken): Promise<any>;
}