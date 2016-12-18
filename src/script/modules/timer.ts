import { pumlhorse } from '../PumlhorseGlobal';
import enforce from '../../util/enforce';

export class TimerModule {
    static startTimer(timer: Timer) {
        var t: Timer;
        if (timer == null || !(timer instanceof Timer)) {
            t = new Timer();
        }
        else {
            t = timer;
        }

        t.start();
        return t
    }

    static stopTimer(timer: Timer) {
        enforce(timer)
            .isNotNull();
        
        if (!timer.stop) {
            throw new Error('Value is not a timer');
        }

        timer.stop();
    }
}

class Timer {
    private _start: Date;
    private _stop: Date;

    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;

    start() {
        this._start = new Date();
        this._stop = null;
    }

    stop() {
        this._stop = new Date();
        this.calculateElapsed();
    }

    private calculateElapsed() {
        this.milliseconds = this._stop.getTime() - this._start.getTime();
        this.seconds = this.getMeasurement(1000);
        this.minutes = this.getMeasurement(1000 * 60);
        this.hours = this.getMeasurement(1000 * 60 * 60);
        this.days = this.getMeasurement(1000 * 60 * 60 * 24);
    }

    private getMeasurement(factor) {
        return Math.floor(this.milliseconds / factor);
    }
}

pumlhorse.module('timer')
    .function('startTimer', TimerModule.startTimer)
    .function('stopTimer', TimerModule.stopTimer);