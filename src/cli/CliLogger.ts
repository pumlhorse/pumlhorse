import { ILogger } from '../script/loggers';

const colors = require('colors');

export class CliLogger implements ILogger {    

    debug(msg: string) {
        console.info(msg);
    }

    log(msg: string) {
        console.log(msg);
    }

    warn(msg: string) {
        console.warn(colors.yellow(msg));
    }

    error(msg: string) {
        console.warn(colors.red(msg));
    }
}