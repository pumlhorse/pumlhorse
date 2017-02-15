
declare namespace pumlhorse {
	
	export namespace profile {

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
	}

	export namespace script {
		export interface IScript {
			run(context: any): Promise<any>;
			addFunction(name: string, func: Function): void;
			addModule(moduleDescriptor: string): void;
			id: string;
			name: string;
		}
	}

	export class App {
	    getScript(scriptDefinition: string): script.IScript;
	    runProfile(profile: profile.IProfile, sessionOutput: profile.ISessionOutput): Promise<any>;
	}
}

export = pumlhorse;

// declare module 'pumlhorse/profile/ISessionOutput' {

// }
// declare module 'pumlhorse/profile/IProfile' {

// }
// declare module 'pumlhorse/script/IScript' {

// }
// declare module 'pumlhorse/IApp' {

// }
// declare module 'pumlhorse/Profile/Profile' {
// 	import { IProfile, Module } from 'pumlhorse/Profile/IProfile';
// 	export class Profile implements IProfile {
// 	    contexts: string[];
// 	    filters: string[];
// 	    include: string[];
// 	    isRecursive: boolean;
// 	    maxConcurrentFiles?: number;
// 	    modules: Module[];
// 	    settings?: Object;
// 	    isVerbose: boolean;
// 	    constructor();
// 	}

// }
// declare module 'pumlhorse/script/ScriptError' {
// 	export class ScriptError extends Error {
// 	    lineNumber: number;
// 	    constructor(error: Error, lineNumber: number);
// 	}

// }
// declare module 'pumlhorse/util/helpers' {
// 	export { getParameters, isValueType, objectByString, assignObjectByString, getItemCount }; function getParameters(func: any): string[]; function isValueType(s: any): any; function objectByString<T>(o: Object, s: string): T; function assignObjectByString(obj: Object, str: string, value: any): void; function getItemCount(obj: any[] | Object): number;

// }
// declare module 'pumlhorse/script/StringParser' {
// 	export enum StringType {
// 	    literal = 0,
// 	    tokenized = 1,
// 	}
// 	export class Part {
// 	    value: string;
// 	    isTokenized: boolean;
// 	    constructor(value: string, type: StringType);
// 	}
// 	export function parse(input: string): Part[];

// }
// declare module 'pumlhorse/script/Step' {
// 	export class Step {
// 	    private parameters;
// 	    private scope;
// 	    private lineNumber;
// 	    assignment: string;
// 	    functionName: string;
// 	    private runFunc;
// 	    constructor(funcName: string, parameters: any, scope: any, lineNumber?: number);
// 	    private isAssignment();
// 	    run(): Promise<void>;
// 	    private runSimpleStep();
// 	    private runComplexStep();
// 	    private getParameterList();
// 	    private getParameter(name, aliases, index);
// 	    private evaluateParameter(value, name);
// 	    private isParameterName(expectedName, actualName, aliases);
// 	    private doAssignment(result);
// 	}

// }
// declare module 'pumlhorse/util/enforce' {
// 	export default function (value: any, parameterName?: string): Enforcement;
// 	export class Enforcement {
// 	    value: any;
// 	    parameterName: string;
// 	    constructor(value: any, parameterName?: string);
// 	    isNotNull(): Enforcement;
// 	    isArray(): Enforcement;
// 	    isNotEmpty(): Enforcement;
// 	    isString(): Enforcement;
// 	    isFunction(overrideMessage?: string): Enforcement;
// 	    private throwError(message, overrideMessage?);
// 	}

// }
// declare module 'pumlhorse/script/Modules' {
// 	export class ModuleRepository {
// 	    static lookup: Object;
// 	    static addModule(name: string): ModuleBuilder;
// 	}
// 	export class ModuleBuilder {
// 	    private module;
// 	    constructor(module: any);
// 	    function(name: string, func: Function | any[]): ModuleBuilder;
// 	    export(): Object;
// 	    asExport(): Object;
// 	}

// }
// declare module 'pumlhorse/script/loggers' {
// 	export { log, warn, error, setLoggers }; function log(...args: string[]): void; function warn(...args: string[]): void; function error(...args: string[]): void; function setLoggers(loggerObj: ILogger): void;
// 	export interface ILogger {
// 	    log(...args: string[]): void;
// 	    warn(...args: string[]): void;
// 	    error(...args: string[]): void;
// 	}

// }
