import { CancellationToken } from '../util/CancellationToken';
import {ICancellationToken} from '../util/ICancellationToken';
import { ModuleLoader } from '../script/ModuleLoader';
import { SessionEvents } from './SessionEvents';
import { ISessionOutput } from './ISessionOutput';
import { IScriptDefinition } from '../script/IScriptDefinition';
import { Script } from '../script/Script';
import { IProfile } from './IProfile';
import { IScript } from '../script/IScript';
import * as _ from 'underscore';
import * as fs from '../util/asyncFs';
import * as path from 'path';
import * as Queue from 'promise-queue';
import * as util from 'util';
import { Runner } from './filters';

export class ProfileRunner {
    private sessionEvents: ISessionOutput;
    private context: any;
    private files: string[];
    private passedScripts: LoadedScript[] = [];
    private failedScripts: LoadedScript[] = [];

    constructor(private profile: IProfile, sessionOutput: ISessionOutput) {
        this.sessionEvents = new SessionEvents(sessionOutput);
    }

    async run(cancellationToken?: ICancellationToken): Promise<any> {
        if (cancellationToken == null) cancellationToken = CancellationToken.None;

        this.loadGlobalModules();
        this.registerFilters();

        try {
            if (!await Runner.onSessionStarting()) {
                return;
            }
            this.sessionEvents.onSessionStarted()
            await Promise.all([
                this.buildContext(),
                this.buildFileList()
            ]);
            await this.runFiles(cancellationToken);
            this.sessionEvents.onSessionFinished(this.passedScripts.length, this.failedScripts.length);
        }
        finally {
            await Runner.onSessionFinished(this.passedScripts.length, this.failedScripts.length);
        }
    }

    private loadGlobalModules() {
        if (this.profile.modules == null) return;

        for (let i = 0; i < this.profile.modules.length; i++) {
            require(this.profile.modules[i].path);
        }
    }

    private registerFilters() {
        if (this.profile.filters == null) return;

        for (let i = 0; i < this.profile.filters.length; i++) {
            require(this.profile.filters[i]);
        }
    }

    private async buildContext(): Promise<any> {
        this.context = {};
        const contexts = this.profile.contexts;
        if (contexts == null ||
            contexts.length == 0) {
            return;
        }

        for (let i = 0; i < contexts.length; i++) {
            const path = contexts[i];
            const context = await this.readContextFile(path);
            _.extend(this.context, context);
        }
    }

    private async readContextFile(filePath: string): Promise<any> {
        if (_.isObject(filePath)) return filePath;

        const isJson = filePath.endsWith('.json');
        const isYaml = filePath.endsWith('.yml') || filePath.endsWith('.yaml');
        if (!isJson && !isYaml) throw new Error('Context file must be .json or .yaml');

        let readFunc = isJson ? fs.readAsJson : fs.readAsYaml;
        const fullPath = path.resolve(filePath);
        let stat;
        try {
            stat = await fs.stat(fullPath);
        }
        catch (err) {
            throw new Error(`Context file "${filePath}" does not exist`);
        }
        return await readFunc(fullPath);
    }

    private async buildFileList() {

        const fileNames = _.uniq(_.flatten(await Promise.all(_.map(this.profile.include, (include) => this.listFilesForPath(include)))));

        this.files = _.filter(fileNames, (name) => name.toLowerCase().endsWith('.puml'));
    }

    private async listFilesForPath(filePath: string): Promise<string[]> {
        const fullPath = path.resolve('.', filePath);

        let stat;
        try {
            stat = await fs.stat(fullPath);
        }
        catch (err) {
            throw new Error(`"${filePath}" is not a file or directory`);
        }

        if (stat.isFile()) {
            return [fullPath];
        }

        if (stat.isDirectory()) {
            const dirFiles = await fs.readdir(fullPath, this.profile.isRecursive);
            return _.map(dirFiles, f => path.resolve(fullPath, f));
        }

        throw new Error(`"${filePath}" is not a file or directory`);
    }

    private async runFiles(cancellationToken: ICancellationToken): Promise<any> {
        const queue = new Queue(this.getMaxConcurrentFiles(), Infinity);

        await Promise.all(_.map(this.files, (file) => queue.add(() => this.runFile(file, cancellationToken))));
    }

    private async runFile(filename: string, cancellationToken: ICancellationToken): Promise<any> {
        if (cancellationToken.isCancellationRequested) return;

        let scriptDetails: LoadedScript;
        try {
            scriptDetails = await LoadedScript.load(filename, this.sessionEvents);
        }
        catch (e) {
            e.message = `Error parsing file ${filename}: ${e.message}`;
            throw e;
        }
        this.sessionEvents.onScriptPending(scriptDetails.script.id, filename, scriptDetails.script.name);
        await this.runScript(scriptDetails, cancellationToken);
    }

    private async runScript(scriptContainer: LoadedScript, cancellationToken: ICancellationToken): Promise<any> {
        if (cancellationToken.isCancellationRequested) return;

        if (!await Runner.onScriptStarting(scriptContainer.script)) {
            return;
        }

        this.sessionEvents.onScriptStarted(scriptContainer.script.id);
        await this.loadModules(scriptContainer);
        scriptContainer.script.addFunction('log', function() { scriptContainer.log.apply(scriptContainer, arguments); });
        scriptContainer.script.addFunction('warn', function() { scriptContainer.warn.apply(scriptContainer, arguments); })
        scriptContainer.script.addFunction('error', function() { scriptContainer.error.apply(scriptContainer, arguments); })

        this.context.__filename = scriptContainer.fileName;
        try {
            await scriptContainer.script.run(this.context, cancellationToken);
            this.passedScripts.push(scriptContainer);
            this.sessionEvents.onScriptFinished(scriptContainer.script.id, null);
            Runner.onScriptFinished(scriptContainer.script, true);
        }
        catch (err) {
            this.failedScripts.push(scriptContainer);
            this.sessionEvents.onScriptFinished(scriptContainer.script.id, err);
            Runner.onScriptFinished(scriptContainer.script, false);
        }
    }

    private async loadModules(s: LoadedScript): Promise<any> {
        const modules = this.profile.modules;
        if (modules != null) {
            for (let i = 0; i < modules.length; i++) {
                s.script.addModule(modules[i].name);
            }
        }

        ModuleLoader.load(s.fileName, s.scriptDefinition.modules);
    }

    private DEFAULT_QUEUE_SIZE = 15;
    private getMaxConcurrentFiles(): number {
        return this.profile.maxConcurrentFiles != null 
            ? this.profile.maxConcurrentFiles
            : this.DEFAULT_QUEUE_SIZE;
    }
}

class LoadedScript {
    script: IScript;

    constructor(public scriptDefinition: IScriptDefinition, public fileName: string, private emitter: ISessionOutput) {
        this.script = new Script(scriptDefinition);
    }

    log() {
        const message = util.format.apply(util, arguments);
        this.emitter.onLog(this.script.id, 'log', message);
    }
    
    warn() {
        const message = util.format.apply(util, arguments);
        this.emitter.onLog(this.script.id, 'warn', message);
    }
    
    error() {
        const message = util.format.apply(util, arguments);
        this.emitter.onLog(this.script.id, 'error', message);
    }

    static async load(filename: string, emitter: ISessionOutput): Promise<LoadedScript> {
        const scriptDefinition = <IScriptDefinition> await fs.readAsYaml(filename);
        return new LoadedScript(scriptDefinition, filename, emitter);
    }
}