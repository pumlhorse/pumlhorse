export class ScriptInterrupt implements Error {
    __nonErrorScriptInterrupt = true;
    
    name = "ScriptInterrupt";

    message = "Script interrupted due to non-error";
}