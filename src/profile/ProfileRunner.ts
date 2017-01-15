import { ModuleLoader } from '../script/ModuleLoader';
import { SessionEvents } from './SessionEvents';
import { ISessionOutput } from './ISessionOutput';
import { IScriptDefinition } from '../script/IScriptDefinition';
import { Script } from '../script/Script';
import { Profile } from './Profile';
import { IProfile } from './IProfile';
import { IScript } from '../script/IScript';
import * as loggers from '../script/loggers';
import * as _ from 'underscore';
import enforce from '../util/enforce';
import * as fs from '../util/asyncFs';
import * as path from 'path';
import * as Queue from 'promise-queue';
import * as util from 'util';
import { runner } from './filters';

export class ProfileRunner {
    private sessionEvents: ISessionOutput;
    private context: any;
    private files: string[];
    private passedScripts: LoadedScript[] = [];
    private failedScripts: LoadedScript[] = [];

    constructor(private profile: IProfile, sessionOutput: ISessionOutput) {
        this.sessionEvents = new SessionEvents(sessionOutput);
    }

    async run(): Promise<any> {

        this.loadGlobalModules();
        this.registerFilters();

        const context = null;

        try {
            if (!await runner.onSessionStarting()) {
                return;
            }
            this.sessionEvents.onSessionStarted()
            await Promise.all([
                this.buildContext(),
                this.buildFileList()
            ]);
            await this.runFiles();
            this.sessionEvents.onSessionFinished(this.passedScripts.length, this.failedScripts.length);
        }
        finally {
            await runner.onSessionFinished(this.passedScripts.length, this.failedScripts.length);
        }
    }

    private 

    private loadGlobalModules() {
        if (this.profile.modules == null) return;

        this.profile.modules.forEach(m => require(m.path));
    }

    private registerFilters() {
        if (this.profile.filters == null) return;

        this.profile.filters.forEach(path => require(path));
    }

    private async buildContext(): Promise<any> {
        this.context = {};
        if (this.profile.contexts == null ||
            this.profile.contexts.length == 0) {
            return;
        }

        for (let i in this.profile.contexts) {
            const path = this.profile.contexts[i];
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

        const fileNames = _.uniq(_.flatten(await Promise.all(this.profile.include.map((include) => this.listFilesForPath(include)))));

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
            return dirFiles.map(f => path.resolve(fullPath, f));
        }

        throw new Error(`"${filePath}" is not a file or directory`);
    }

    private async runFiles(): Promise<any> {
        var queue = new Queue(this.getMaxConcurrentFiles(), Infinity);

        await Promise.all(this.files.map((file) => queue.add(() => this.runFile(file))));
    }

    private async runFile(filename: string): Promise<any> {
        var scriptDetails = await LoadedScript.load(filename, this.sessionEvents);
        this.sessionEvents.onScriptPending(scriptDetails.script.id, filename);
        await this.runScript(scriptDetails);
    }

    private async runScript(scriptContainer: LoadedScript): Promise<any> {
        if (!await runner.onScriptStarting(scriptContainer.script)) {
            return;
        }

        this.sessionEvents.onScriptStarted(scriptContainer.script.id);
        await this.loadModules(scriptContainer);
        scriptContainer.script.addFunction('log', function() { scriptContainer.log.apply(scriptContainer, arguments); });
        scriptContainer.script.addFunction('warn', function() { scriptContainer.log.apply(scriptContainer, arguments); })
        scriptContainer.script.addFunction('error', function() { scriptContainer.log.apply(scriptContainer, arguments); })

        const start = new Date();

        this.context.__filename = scriptContainer.fileName;
        try {
            await scriptContainer.script.run(this.context);
            this.passedScripts.push(scriptContainer);
            this.sessionEvents.onScriptFinished(scriptContainer.script.id, null);
            runner.onScriptFinished(scriptContainer.script, true);
        }
        catch (err) {
            this.failedScripts.push(scriptContainer);
            this.sessionEvents.onScriptFinished(scriptContainer.script.id, err);
            runner.onScriptFinished(scriptContainer.script, false);
        }
    }

    private async loadModules(s: LoadedScript): Promise<any> {
        if (this.profile.modules != null) {
            this.profile.modules.forEach((m) => {
                s.script.addModule(m.name)
            })
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
        var message = util.format.apply(util, arguments);
        this.emitter.onLog(this.script.id, 'log', message);
    }
    
    warn() {
        var message = util.format.apply(util, arguments);
        this.emitter.onLog(this.script.id, 'warn', message);
    }
    
    error() {
        var message = util.format.apply(util, arguments);
        this.emitter.onLog(this.script.id, 'error', message);
    }

    static async load(filename: string, emitter: ISessionOutput): Promise<LoadedScript> {
        const scriptDefinition = <IScriptDefinition> await fs.readAsYaml(filename);
        return new LoadedScript(scriptDefinition, filename, emitter);
    }
}