import { IScript } from '../script/IScript';
import * as _ from 'underscore';
import enforce from '../util/enforce';
import * as helpers from '../util/helpers';
import * as loggers from '../script/loggers';

interface IFilterRunner {
    onSessionStarting(): Promise<boolean>;
    onScriptStarting(script: IScript): Promise<boolean>;
    onScriptFinished(script: IScript, isSuccess: boolean): Promise<any>;
    onSessionFinished(passedScripts: number, failedScripts: number): Promise<any>;
}

class FilterRunner implements IFilterRunner {

    sessionStartingFilters: (() => boolean)[] = [];
    async onSessionStarting(): Promise<boolean> {
        let shouldContinue: boolean = true;
        for(var i = 0; i < this.sessionStartingFilters.length && shouldContinue !== false; i++) {
            try {
                shouldContinue = await this.sessionStartingFilters[i]();
            }
            catch (err) {
                loggers.error(`SessionStarting filter returned error. ${err.message ? err.message : err}`);
                shouldContinue = false;
            }
        }

        return shouldContinue !== false;
    }

    scriptStartingFilters: ((s: IScript) => boolean)[] = [];
    async onScriptStarting(script: IScript): Promise<boolean> {
        let shouldContinue: boolean = true;
        for(var i = 0; i < this.scriptStartingFilters.length && shouldContinue !== false; i++) {
            try {
                shouldContinue = await this.scriptStartingFilters[i](script);
            }
            catch (err) {
                loggers.error(`ScriptStarting filter returned error. ${err.message ? err.message : err}`);
                shouldContinue = false;
            }
        }

        return shouldContinue !== false;
    }

    scriptFinishedFilters: ((s: IScript, success: boolean) => void)[] = [];
    async onScriptFinished(script: IScript, isSuccess: boolean): Promise<any> {
        let shouldContinue: boolean = true;
        for(var i = 0; i < this.scriptFinishedFilters.length && shouldContinue !== false; i++) {
            try {
                await this.scriptFinishedFilters[i](script, isSuccess);
            }
            catch (err) {
                loggers.error(`ScriptFinished filter returned error. ${err.message ? err.message : err}`);
                shouldContinue = false;
            }
        }

        return;
    }

    sessionFinishedFilters: ((passed: number, failed: number) => void)[] = [];
    async onSessionFinished(passedScripts: number, failedScripts: number): Promise<any> {
        let shouldContinue: boolean = true;
        for(var i = 0; i < this.sessionFinishedFilters.length && shouldContinue !== false; i++) {
            try {
                await this.sessionFinishedFilters[i](passedScripts, failedScripts);
            }
            catch (err) {
                loggers.error(`sessionFinished filter returned error. ${err.message ? err.message : err}`);
                shouldContinue = false;
            }
        }

        return;
    }
}

export interface IFilterBuilder {
    onSessionStarting(handler: (() => boolean)): IFilterBuilder;
    onScriptStarting(handler: ((s: IScript) => boolean)): IFilterBuilder;
    onScriptFinished(handler: ((s: IScript, success: boolean) => void)): IFilterBuilder;
    onSessionFinished(handler: ((passed: number, failed: number) => void)): IFilterBuilder;
}

class FilterBuilder implements IFilterBuilder {

    constructor(private runner: FilterRunner) {

    }

    onSessionStarting(handler: (() => boolean)): IFilterBuilder {
        enforce(handler, 'handler')
            .isFunction();
        this.runner.sessionStartingFilters.push(handler);
        return this;
    }

    onScriptStarting(handler: ((s: IScript) => boolean)): IFilterBuilder {
        enforce(handler, 'handler')
            .isFunction();
        this.runner.scriptStartingFilters.push(handler);
        return this;
    }

    onScriptFinished(handler: ((s: IScript, success: boolean) => void)): IFilterBuilder {
        enforce(handler, 'handler')
            .isFunction();
        this.runner.scriptFinishedFilters.push(handler);
        return this;
    }

    onSessionFinished(handler: ((passed: number, failed: number) => void)): IFilterBuilder {
        enforce(handler, 'handler')
            .isFunction();
        this.runner.sessionFinishedFilters.push(handler);
        return this;
    }
}

const _runner: FilterRunner = new FilterRunner();

export const Runner: IFilterRunner = _runner;

export function getFilterBuilder(): IFilterBuilder {
    return new FilterBuilder(_runner);
}


