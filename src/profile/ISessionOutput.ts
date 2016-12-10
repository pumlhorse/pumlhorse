export interface ISessionOutput {
    onSessionStarted();
    onSessionFinished();
    onScriptPending();
    onScriptStarted();
    onScriptFinished();
    onLog();
    onStepStarted();
    onStepFinished();
    onHttpSent();
    onHttpReceived();
}