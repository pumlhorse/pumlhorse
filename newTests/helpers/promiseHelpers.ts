export { assertPromiseResolved, assertPromiseRejected }

function assertPromiseResolved(promise, doneFunc) {
    return function () {
        if (!promise.isFulfilled()) {
            console.error(promise.reason())
        }
        expect(promise.isFulfilled()).toBe(true);
        doneFunc();
    }
}

function assertPromiseRejected(promise, doneFunc) {
    return function () {
        expect(promise.isRejected()).toBe(true);
        doneFunc();
    }
}