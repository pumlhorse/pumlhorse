import { ISessionOutput } from './ISessionOutput';
import { EventEmitter } from 'events';

export class SessionEvents implements ISessionOutput {
    private emitter: EventEmitter;

    constructor(private sessionOutput: ISessionOutput) {
        this.emitter = new EventEmitter();

        this.addListener(Event.SessionStart, () => sessionOutput.onSessionStarted());
        this.addListener(Event.SessionFinish, (p, f) => sessionOutput.onSessionFinished(p, f));
        this.addListener(Event.ScriptPending, (id, n) => sessionOutput.onScriptPending(id, n));
        this.addListener(Event.ScriptStart, (id) => sessionOutput.onScriptStarted(id));
        this.addListener(Event.ScriptFinish, (id, err) => sessionOutput.onScriptFinished(id, err));
        this.addListener(Event.Log, (id, lvl, msg) => sessionOutput.onLog(id, lvl, msg));
        this.addListener(Event.HttpSend, sessionOutput.onHttpSent);
        this.addListener(Event.HttpReceive, sessionOutput.onHttpReceived);
    }

    onSessionStarted() {
        this.emitter.emit(Event.SessionStart);
    }

    onSessionFinished(scriptsPassed: number, scriptsFailed: number) {
        this.emitter.emit(Event.SessionFinish, scriptsPassed, scriptsFailed);
    }

    onScriptPending(scriptId: string, scriptName: string) {
        this.emitter.emit(Event.ScriptPending, scriptId, scriptName);
    }

    onScriptStarted(scriptId: string) {
        this.emitter.emit(Event.ScriptStart, scriptId);
    }

    onScriptFinished(scriptId: string, error: any) {
        this.emitter.emit(Event.ScriptFinish, scriptId, error);
    }

    onLog(scriptId: string, level: string, message: string) {
        this.emitter.emit(Event.Log, scriptId, level, message);
    }

    onHttpSent() {
        this.emitter.emit(Event.HttpSend);
    }

    onHttpReceived() {
        this.emitter.emit(Event.HttpReceive);
    }

    private addListener(eventName: string, listener) {
        if (listener == null) return;

        this.emitter.on(eventName, listener);
    }
}

class Event {
    static SessionStart = 'sessionStart';
    static SessionFinish = 'sessionFinish';
    static ScriptPending = 'scriptPending';
    static ScriptStart = 'scriptStart'; 
    static ScriptFinish = 'scriptFinish';
    static Log = 'log'; 
    static HttpSend = 'httpSend';
    static HttpReceive = 'httpReceive'; 
}