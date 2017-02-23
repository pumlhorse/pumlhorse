
export class Module {
	name: string;
	path: string;
}

export interface IProfile {
	contexts: string[];
	filters: string[];
	include: string[];
	isRecursive: boolean;
	maxConcurrentFiles?: number;
	modules: Module[];
	settings?: Object;
	isVerbose: boolean;
}

export interface ISessionOutput {
	onSessionStarted(): any;
	onSessionFinished(scriptsPassed: number, scriptsFailed: number): any;
	onScriptPending(scriptId: string, fileName: string, scriptName: string): any;
	onScriptStarted(scriptId: string): any;
	onScriptFinished(scriptId: string, error: any): any;
	onLog(scriptId: string, logLevel: string, message: string): any;
	onHttpSent(): any;
	onHttpReceived(): any;
}

export interface IScript {
	run(context: any): Promise<any>;
	addFunction(name: string, func: Function): void;
	addModule(moduleDescriptor: string): void;
	id: string;
	name: string;
}

export class App {
	getScript(scriptDefinition: string): IScript;
	runProfile(profile: IProfile, sessionOutput: ISessionOutput): Promise<any>;
}
