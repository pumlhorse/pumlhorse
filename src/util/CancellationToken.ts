import {ICancellationToken} from '../util/ICancellationToken';
import {EventEmitter} from 'events';

export class CancellationToken implements ICancellationToken
{
    
    constructor(private subscription: Function) {
    }
    isCancellationRequested: boolean;
    onCancellationRequested(callback) {
        this.subscription(callback);
    }
}

export class CancellationTokenHandle {
    token: ICancellationToken;
    private emitter: EventEmitter;

    constructor() {
        this.emitter = new EventEmitter();
        this.token = new CancellationToken((cb) => this.emitter.on('cancel', cb));
    }

    cancel() {
        this.emitter.emit('cancel');
        this.token.isCancellationRequested = true;
    }
}

export namespace CancellationToken {
    export const None: ICancellationToken = new CancellationToken(() => {});

    export function await<T>(promise: Promise<T>, cancellationToken: ICancellationToken): Promise<T> {
        return cancellationToken == null
            ? promise
            : new Promise((resolve, reject) => {
            cancellationToken.onCancellationRequested(() => resolve());
            promise.then(resolve).catch(reject);
        })
    }
}