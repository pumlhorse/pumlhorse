// import { ISessionOutput } from './ISessionOutput';
// import { IScriptDefinition } from './IScriptDefinition';
// import { Script } from './Script';
// import { Profile } from './Profile';
// import { IPromise } from './IPromise';
// import { IProfile } from './IProfile';
// import { IScript } from './IScript';
// import { IApp } from './IApp';
// import * as loggers from './loggers';
// import * as _ from 'underscore';
// import enforce from './enforce';
// import * as Promise from 'bluebird';
// import * as fs from '../lib/promiseFs';
// import * as path from 'path';

// const YAML = require('pumlhorse-yamljs');

// export class App implements IApp {

//     private defaultProfile: IProfile;

//     constructor() {
//         this.defaultProfile = new Profile();
//         this.defaultProfile.include = ['.'];
//     }

//     getScript(scriptText: string): IScript {
//         const scriptDefinition = YAML.parse(scriptText);
//         return new Script(scriptDefinition);
//     }

//     runProfile(profile: IProfile, sessionOutput: ISessionOutput): IPromise<any> {
//         _.defaults(profile, this.defaultProfile);

//         const runner = new ProfileRunner(profile);

//         return runner.run();
//     }

//     /* Obsolete */
//     load(scriptDefinition: string): IScript {
//         loggers.warn('Function "load" is obsolete. Use "getScript" instead');
//         return this.getScript(scriptDefinition);
//     }
// }

// export class ProfileRunner {
//     private scriptsRun: number;
//     private scriptsFailed: number;
//     private context: any;

//     constructor(private profile: IProfile) {

//     }

//     run(): IPromise<any> {
//         this.scriptsRun = 0;
//         this.scriptsFailed = 0;

//         this.loadGlobalModules();
//         this.registerFilters();
//         this.addSettings();

//         const context = null;

//         let scriptsRun = 0, scriptsFailed = 0;

//         return filters.onSessionStarting()
//             .then(() => this.emitEvent(Event.SessionStart))
//             .then(() => this.buildContext())
//             .then(context => this.listFiles(context))
//             .then(files => this.filterFiles(files))
//             .then(files => this.runFiles(files))
//             .then(results => this.analyzeResults(results))
//             .finally(() => filters.onSessionFinished(scriptsRun))
//     }

//     private loadGlobalModules() {
//         if (this.profile.modules == null) return;

//         this.profile.modules.forEach(m => require(m.path));
//     }

//     private registerFilters() {
//         if (this.profile.filters == null) return;

//         this.profile.filters.forEach(path => require(path));
//     }

//     private addSettings() {
//         //TODO
//     }

//     private buildContext(): IPromise<any> {
//         if (this.profile.contexts == null ||
//             this.profile.contexts.length == 0) {
//             this.context = {};
//             return;
//         }

//         return Promise.mapSeries(this.profile.contexts, path => this.readContextFile(path))
//             .then((contexts: any[]) => this.context = _.extend.apply(_, contexts));
//     }

//     private readContextFile(filePath: string): any {
//         if (_.isObject(filePath)) return filePath;

//         const isJson = filePath.endsWith('.json');
//         const isYaml = filePath.endsWith('.yml') || filePath.endsWith('.yaml');
//         if (!isJson && !isYaml) throw new Error('Context file must be .json or .yaml');

//         let readFunc = isJson ? fs.readAsJson : fs.readAsYaml;
//         const fullPath = path.resolve(filePath);
//         return fs.stat(fullPath)
//             .then(stat => {
//                 if (!stat.isFile()) throw new Error(`Context file "${filePath}" does not exist`);
//                 return fullPath;
//             })
//             .catch(err => {
//                 throw new Error(`Context file "${filePath}" does not exist`);
//             })
//             .then(() => readFunc(fullPath));
//     }

//     private listFiles(): IPromise<any> {
        
//     }
// }