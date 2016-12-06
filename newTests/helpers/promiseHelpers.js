"use strict";
function assertPromiseResolved(promise, doneFunc) {
    return function () {
        if (!promise.isFulfilled()) {
            console.error(promise.reason());
        }
        expect(promise.isFulfilled()).toBe(true);
        doneFunc();
    };
}
exports.assertPromiseResolved = assertPromiseResolved;
function assertPromiseRejected(promise, doneFunc) {
    return function () {
        expect(promise.isRejected()).toBe(true);
        doneFunc();
    };
}
exports.assertPromiseRejected = assertPromiseRejected;
//# sourceMappingURL=promiseHelpers.js.map