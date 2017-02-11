export class ScriptError extends Error {
    public lineNumber: number;

    constructor(error: Error, lineNumber: number) {
        super(error.message);
        this.stack = error.stack;
        this.lineNumber = (<ScriptError>error).lineNumber == null ? lineNumber : (<ScriptError>error).lineNumber;
    }
}