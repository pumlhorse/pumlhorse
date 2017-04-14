export { getLogger, setLogger };

class BasicLogger implements ILogger {

    public debug(msg: string): void {
        console.info(msg);
    }

    public log(msg: string): void {
        console.log(msg);
    }

    public warn(msg: string): void {
        console.warn(msg);
    }

    public error(msg: string): void {
        console.error(msg);
    }
}

let loggers: ILogger = new BasicLogger();

function getLogger(): ILogger {
    return loggers;
}

function setLogger(loggerObj: ILogger) {
    loggers = loggerObj;
}

export interface ILogger {
    debug(msg: string): void;
    log(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
}