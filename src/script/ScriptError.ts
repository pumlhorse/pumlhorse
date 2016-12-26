export class ScriptError extends Error {

    constructor(error: Error, public lineNumber: number) {
        super(error.message);
    }
}