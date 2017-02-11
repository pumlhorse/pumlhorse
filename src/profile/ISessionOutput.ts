export interface ISessionOutput {
    onSessionStarted();
    onSessionFinished(scriptsPassed: number, scriptsFailed: number);
    onScriptPending(scriptId: string, fileName: string, scriptName: string);
    onScriptStarted(scriptId: string);
    onScriptFinished(scriptId: string, error: any);
    onLog(scriptId: string, logLevel: string, message: string);
    onHttpSent();
    onHttpReceived();
}