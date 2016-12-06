export { log, warn, error, setLoggers };

let loggers: ILogger = {
    log : (...args: string[]) => console.log.apply(console, args),
    warn: (...args: string[]) => console.warn.apply(console, args),
    error: (...args: string[]) => console.error.apply(console, args),
}

function log(...args: string[]) {
    loggers.log.apply(this, args);
}

function warn(...args: string[]) {
    loggers.warn.apply(this, args);
}

function error(...args: string[]) {
    loggers.error.apply(this, args);
}

function setLoggers(loggerObj: ILogger) {
    loggers = loggerObj;
}

interface ILogger {
    log(...args: string[]): void;
    warn(...args: string[]): void;
    error(...args: string[]): void;
}