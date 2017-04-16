import { ILogger } from '../script/loggers';
import { IProfile } from '../profile/Profile';
import { ISessionOutput } from '../profile/ISessionOutput';
const colors = require('colors');

export class CliOutput implements ISessionOutput {

    private scriptLogs: {[id: string]: BufferedLogger} = {};

    constructor(private profile: IProfile, private cliLogger: ILogger) {

    }

    onSessionFinished(passed, failures) {
        const totalCount = passed + failures;
        if (totalCount == 0) {
            this.cliLogger.log('0 scripts run. No .puml files found')
        }
        else {
            const failuresMsg = failures == 0 
                ? '0 failures'
                : colors.red(failures + (failures == 1 ? ' failure' : ' failures'));
            this.cliLogger.log(`${totalCount} scripts run, ${failuresMsg}`);
        }
    }
    
    onScriptPending(id: string, fileName: string, scriptName: string) {
        this.scriptLogs[id] = new BufferedLogger(fileName, scriptName);
    }

    onScriptFinished(id, err) {
        const logger = this.scriptLogs[id];
        if (err) {
            const lineNumber = err.lineNumber ? 'Line ' + err.lineNumber + ': ' : '';
            logger.log('error', lineNumber + (err.message ? err.message : err));
            if (this.profile.isVerbose && err.stack != null) {
                logger.log('error', lineNumber + err.stack);
            }
            logger.log('error', 'SCRIPT FAILED');
        }
        this.scriptLogs[id].flush(this.cliLogger);
    }

    onLog(id, level, message) {
        this.scriptLogs[id].log(level, message)
    }

    onSessionStarted() {}
    onScriptStarted()  {}
    onHttpSent() {}
    onHttpReceived() {}
}

class LogMessage {
    constructor(public message: string, public level: string) {}
}

class BufferedLogger {
    private messages: LogMessage[] = [];

    constructor(private fileName: string, private scriptName: string) {
        
    }
    
    flush(logger: ILogger) {
        if (this.messages.length > 0) {
            logger.log('--------------');
            logger.log(`## ${this.scriptName} - ${this.fileName} ##`);
            for (let i = 0; i < this.messages.length; i++) {
                let m = this.messages[i];
                logger[m.level](m.message)
            }
        }
    }
    
    log(level: string, message: string) {
        this.messages.push(new LogMessage(message, level));
    }
}