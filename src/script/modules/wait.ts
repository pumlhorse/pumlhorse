import { CancellationToken } from '../../util/CancellationToken';
import { ICancellationToken } from '../../util/ICancellationToken';
import { pumlhorse } from '../../PumlhorseGlobal';
export class WaitModule {
    //TODO: add implementation, add misc/timer/wait to Script as default modules
    static wait(milliseconds: number, seconds: number, minutes: number, hours: number, $cancellationToken: ICancellationToken): Promise<any> {
        
        const totalMs = WaitModule.convertToMs(milliseconds, 1) +
            WaitModule.convertToMs(seconds, 1000) +
            WaitModule.convertToMs(minutes, 1000 * 60) + 
            WaitModule.convertToMs(hours, 1000 * 60 * 60);
        return CancellationToken.await(new Promise((resolve) => {
            setTimeout(function () {
                resolve()
            }, totalMs);
        }), $cancellationToken);
    }

    private static convertToMs(value: number, factor: number): number {
        return value ? value * factor : 0
    }
}

pumlhorse.module('wait')
    .function('wait', WaitModule.wait);