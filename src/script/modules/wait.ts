export class WaitModule {
    //TODO: add implementation, add misc/timer/wait to Script as default modules
    wait(milliseconds: number, seconds: number, minutes: number, hours: number): Promise<any> {
        
        const totalMs = WaitModule.convertToMs(milliseconds, 1) +
            WaitModule.convertToMs(seconds, 1000) +
            WaitModule.convertToMs(minutes, 1000 * 60) + 
            WaitModule.convertToMs(hours, 1000 * 60 * 60);
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve()
            }, totalMs);
        })
    }

    private static convertToMs(value: number, factor: number): number {
        return value ? value * factor : 0
    }
}