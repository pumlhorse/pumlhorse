export interface ICancellationToken {
    onCancellationRequested: Function;
    isCancellationRequested: boolean;
}