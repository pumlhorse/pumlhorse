import { ILogger, getLogger } from '../script/loggers';
import { IScript } from '../script/Script';
import enforce from '../util/enforce';
import { IScope } from "../script/Scope";

const sessionStartingFilters: (() => boolean)[] = [];
const scriptStartingFilters: ((s: IScript, sc: IScope) => boolean)[] = [];
const scriptFinishedFilters: ((s: IScript, sc: IScope, success: boolean) => void)[] = [];
const sessionFinishedFilters: ((passed: number, failed: number) => void)[] = [];

export class FilterRunner {
    logger: ILogger;

    constructor() {
        this.logger = getLogger();
    }

    async onSessionStarting(): Promise<boolean> {
        let shouldContinue: boolean = true;
        for(let i = 0; i < sessionStartingFilters.length && shouldContinue !== false; i++) {
            try {
                shouldContinue = await sessionStartingFilters[i]();
            }
            catch (err) {
                this.logger.error(`SessionStarting filter returned error. ${err.message ? err.message : err}`);
                shouldContinue = false;
            }
        }

        return shouldContinue !== false;
    }

    async onScriptStarting(script: IScript, scope: IScope): Promise<boolean> {
        let shouldContinue: boolean = true;
        for(let i = 0; i < scriptStartingFilters.length && shouldContinue !== false; i++) {
            try {
                shouldContinue = await scriptStartingFilters[i](script, scope);
            }
            catch (err) {
                this.logger.error(`ScriptStarting filter returned error. ${err.message ? err.message : err}`);
                shouldContinue = false;
            }
        }

        return shouldContinue !== false;
    }

    async onScriptFinished(script: IScript, scope: IScope, isSuccess: boolean): Promise<any> {
        let shouldContinue: boolean = true;
        for(let i = 0; i < scriptFinishedFilters.length && shouldContinue !== false; i++) {
            try {
                await scriptFinishedFilters[i](script, scope, isSuccess);
            }
            catch (err) {
                this.logger.error(`ScriptFinished filter returned error. ${err.message ? err.message : err}`);
                shouldContinue = false;
            }
        }

        return;
    }

    async onSessionFinished(passedScripts: number, failedScripts: number): Promise<any> {
        let shouldContinue: boolean = true;
        for(let i = 0; i < sessionFinishedFilters.length && shouldContinue !== false; i++) {
            try {
                await sessionFinishedFilters[i](passedScripts, failedScripts);
            }
            catch (err) {
                this.logger.error(`sessionFinished filter returned error. ${err.message ? err.message : err}`);
                shouldContinue = false;
            }
        }

        return;
    }
}

export class FilterBuilder {

    onSessionStarting(handler: (() => boolean)): FilterBuilder {
        enforce(handler, 'handler')
            .isFunction();
        sessionStartingFilters.push(handler);
        return this;
    }

    onScriptStarting(handler: ((s: IScript, sc: IScope) => boolean)): FilterBuilder {
        enforce(handler, 'handler')
            .isFunction();
        scriptStartingFilters.push(handler);
        return this;
    }

    onScriptFinished(handler: ((s: IScript, sc: IScope, success: boolean) => void)): FilterBuilder {
        enforce(handler, 'handler')
            .isFunction();
        scriptFinishedFilters.push(handler);
        return this;
    }

    onSessionFinished(handler: ((passed: number, failed: number) => void)): FilterBuilder {
        enforce(handler, 'handler')
            .isFunction();
        sessionFinishedFilters.push(handler);
        return this;
    }
}


