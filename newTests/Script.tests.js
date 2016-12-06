"use strict";
var _this = this;
var Script_1 = require('../src/Script');
var loggers_1 = require('../src/loggers');
var Promise = require('bluebird');
describe('Script', function () {
    var loggerMocks;
    var mock;
    beforeEach(function () {
        mock = jasmine.createSpy('mock');
        loggerMocks = jasmine.createSpyObj('loggers', ['log', 'warn', 'error']);
        loggers_1.setLoggers(loggerMocks);
    });
    it('should display a warning when there are no steps', function (done) {
        var script = getScript([]);
        var promise = script.run();
        promise.then(function () {
            expect(loggerMocks.warn).toHaveBeenCalledWith('Script does not contain any steps');
        })
            .finally(assertPromiseResolved(promise, done));
    });
    it('does not display a warning when there is at least one test step', function (done) {
        var script = getScript(['noop']);
        var promise = script.run();
        promise.then(function () {
            expect(loggerMocks.warn).not.toHaveBeenCalled();
        })
            .finally(assertPromiseResolved(promise, done));
    });
    it('runs raw javascript if step is a string and not a function name', function (done) {
        var script = getScript(['${noop("new value")}']);
        var noop = jasmine.createSpy('noop');
        script.addFunction('noop', noop);
        var promise = script.run();
        promise.then(function () {
            expect(noop).toHaveBeenCalledWith('new value');
        })
            .finally(assertPromiseResolved(promise, done));
    });
    it('does not run a function with parameters if it doesnt exist', function (done) {
        var script = getScript([{
                doesNotExistFunc: {
                    var1: "x"
                }
            }]);
        var promise = script.run();
        promise.catch(function (err) {
            expect(err).toBe('Function "doesNotExistFunc" does not exist');
        })
            .finally(assertPromiseRejected(promise, done));
    });
    describe('with parameters', function () {
        it('passes parameters to function', function (done) {
            function testWithParameters(var1, var2, var3) { mock(var1, var2, var3); }
            var testObj = { f: 3 };
            var script = getScript([
                {
                    'testWithParameters': {
                        var1: 'var1',
                        var3: testObj,
                        var2: 2
                    }
                }
            ]);
            script.addFunction('testWithParameters', testWithParameters);
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith('var1', 2, testObj);
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('accepts complex parameters', function (done) {
            function testComplex(var1) { mock(var1); }
            var script = getScript([
                {
                    'testComplex': {
                        var1: {
                            innerVal: "${2 + 2}"
                        }
                    }
                }
            ]);
            script.addFunction('testComplex', testComplex);
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith({ innerVal: 4 });
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('passes undefined for missing parameters', function (done) {
            function testMissing(var1) { mock(var1); }
            var script = getScript([
                {
                    'testMissing': {
                        var3: 'ignored'
                    }
                }
            ]);
            script.addFunction('testMissing', testMissing);
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith(undefined);
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('accepts variables in parameters', function (done) {
            function testParameterWithVariable(var1) { mock(var1); }
            var script = getScript([
                {
                    'testParameterWithVariable': {
                        var1: '${3 * 7}'
                    }
                }
            ]);
            script.addFunction('testParameterWithVariable', testParameterWithVariable);
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith(21);
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('handles complex object variables in parameters', function (done) {
            var complexObj = { nested: { val: 144 } };
            var script = getScript([
                'complexObj = returnComplexObj',
                {
                    'testComplexParameter': {
                        var1: '$complexObj.nested.val'
                    }
                }
            ]);
            script.addFunction('testComplexParameter', function (var1) { mock(var1); });
            script.addFunction('returnComplexObj', function () { return complexObj; });
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith(144);
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('allows variables inside string literals', function (done) {
            var script = getScript([
                'url = http://example.org',
                {
                    'testStringLiteral': 'String literal with $url/somePath here'
                }
            ]);
            script.addFunction('testStringLiteral', function (var1) { mock(var1); });
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith('String literal with http://example.org/somePath here');
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('persists complex type information in variables', function (done) {
            var dt = new Date();
            var script = getScript([
                'date = returnDate',
                {
                    testObj: '$date'
                }
            ]);
            script.addFunction('returnDate', function () { return dt; });
            script.addFunction('testObj', function (var1) { mock(var1); });
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith(dt);
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('handles assignment for values that are promises', function (done) {
            var deferred = Promise.resolve('promise value');
            var script = getScript([
                'p = returnPromise',
                {
                    testObj: '$p'
                }
            ]);
            script.addFunction('returnPromise', function () { return deferred; });
            script.addFunction('testObj', function (var1) { mock(var1); });
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith('promise value');
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('passes simple arguments items for anonymous parameter', function (done) {
            var func = function (val) {
                mock(val);
            };
            func['__alias'] = ['@'];
            var script = getScript([
                {
                    testWithAnonymousParameter: 456
                }
            ]);
            script.addFunction('testWithAnonymousParameter', func);
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith(456);
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('passes complex arguments items for anonymous parameter', function (done) {
            var func = function (val) {
                mock(val);
            };
            func['__alias'] = ['@'];
            func['__passAsObject'] = true;
            var script = getScript([
                {
                    testWithAnonymousParameter: {
                        testVal: 456,
                        complex: { val: "here" }
                    }
                }
            ]);
            script.addFunction('testWithAnonymousParameter', func);
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith({
                    testVal: 456,
                    complex: { val: "here" }
                });
            })
                .finally(assertPromiseResolved(promise, done));
        });
    });
    describe('Assignment', function () {
        it('assigns value if value is not a function', function (done) {
            var script = getScript([
                'val1 = some-test-string',
                {
                    noop: {
                        value: '$val1'
                    }
                }
            ]);
            script.addFunction('noop', function (value) { return mock(value); });
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith('some-test-string');
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('assigns value containing equal sign', function (done) {
            var script = getScript([
                'val1 = db=something;connection=false',
                {
                    noop: {
                        value: '$val1'
                    }
                }
            ]);
            script.addFunction('noop', function (value) { return mock(value); });
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith('db=something;connection=false');
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('assigns null function result to variable', function (done) {
            var script = getScript([
                'val1 = returnNull',
                {
                    noop: {
                        value: '$val1'
                    }
                }
            ]);
            script.addFunction('returnNull', function (value) { return null; });
            script.addFunction('noop', function (value) { return mock(value); });
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith(null);
            })
                .finally(assertPromiseResolved(promise, done));
        });
    });
    describe('with context', function () {
        it('allows a null context', function (done) {
            var script = getScript([
                'noop'
            ]);
            script.addFunction('noop', function (value) { return mock(value); });
            var promise = script.run(null);
            promise.then(function () {
                expect(mock).toHaveBeenCalled();
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('allows a context passed in', function (done) {
            var script = getScript([
                {
                    doThing: {
                        someVal: '$val1',
                        someOtherVal: '$val2'
                    }
                }
            ]);
            script.addFunction('doThing', function (someVal, someOtherVal) { return mock(someVal, someOtherVal); });
            var promise = script.run({
                val2: 'second value',
                val1: 'first value'
            });
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith('first value', 'second value');
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('allows a complex context', function (done) {
            var script = getScript([
                {
                    doThing: {
                        someVal: '$val1.nested.val',
                    }
                }
            ]);
            script.addFunction('doThing', function (someVal) { return mock(someVal); });
            var promise = script.run({
                val1: {
                    nested: {
                        val: 'abcd'
                    }
                }
            });
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith('abcd');
            })
                .finally(assertPromiseResolved(promise, done));
        });
    });
    describe('with modules', function () {
        it('throws an error if module doesnt exist', function (done) {
            var promise = Promise.method(function () {
                return new Script_1.Script({
                    name: 'test script',
                    modules: ['badModule'],
                    steps: ['noop']
                });
            })();
            promise.catch(function (err) {
                expect(err.message).toBe('Module "badModule" does not exist');
                expect(mock).not.toHaveBeenCalled();
            })
                .finally(assertPromiseRejected(promise, done));
        });
        it('uses a valid module', function (done) {
            Script_1.pumlhorse.module('goodModule')
                .function('sayHello', function () { return mock(); });
            var script = new Script_1.Script({
                name: 'test script',
                modules: ['goodModule'],
                steps: ['sayHello']
            });
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalled();
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('allows namespaces for modules', function (done) {
            Script_1.pumlhorse.module('goodModule')
                .function('sayHello', function () { return mock(); });
            var script = new Script_1.Script({
                name: 'test script',
                modules: ['myModule = goodModule'],
                steps: ['myModule.sayHello']
            });
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalled();
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('provides the correct scope to namespaced modules', function (done) {
            Script_1.pumlhorse.module('goodModule')
                .function('sayHello', function () { mock(this); });
            var script = new Script_1.Script({
                name: 'test script',
                modules: ['myModule = goodModule'],
                steps: ['myModule.sayHello']
            });
            var promise = script.run({ someVal: 321 });
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith(jasmine.objectContaining({
                    $emit: jasmine.any(Function),
                    someVal: 321
                }));
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('provides the correct scope to namespaced modules with parameters', function (done) {
            Script_1.pumlhorse.module('goodModule')
                .function('sayHello', function (param1, param2) { mock(this, param1, param2); });
            var script = new Script_1.Script({
                name: 'test script',
                modules: ['myModule = goodModule'],
                steps: [{ 'myModule.sayHello': { param1: 11, param2: 22 } }]
            });
            var promise = script.run({ someVal: 321 });
            promise.then(function () {
                expect(mock).toHaveBeenCalledWith(jasmine.objectContaining({
                    $emit: jasmine.any(Function),
                    someVal: 321
                }), 11, 22);
            })
                .finally(assertPromiseResolved(promise, done));
        });
        it('allows a module to access another module through $module', function (done) {
            Script_1.pumlhorse.module('goodModule')
                .function('sayHello', function () { mock(); });
            Script_1.pumlhorse.module('otherModule')
                .function('callOtherModule', function () {
                var scope = _this;
                scope.$module('goodModule').sayHello();
            });
            var script = new Script_1.Script({
                name: 'test script',
                modules: ['myModule = goodModule', 'otherModule'],
                steps: ['callOtherModule']
            });
            var promise = script.run();
            promise.then(function () {
                expect(mock).toHaveBeenCalled();
            })
                .finally(assertPromiseResolved(promise, done));
        });
    });
});
function getScript(steps) {
    return new Script_1.Script({
        name: 'test script',
        steps: steps
    });
}
function assertPromiseResolved(promise, doneFunc) {
    return function () {
        if (!promise.isFulfilled()) {
            console.error(promise.reason());
        }
        expect(promise.isFulfilled()).toBe(true);
        doneFunc();
    };
}
function assertPromiseRejected(promise, doneFunc) {
    return function () {
        expect(promise.isRejected()).toBe(true);
        doneFunc();
    };
}
//# sourceMappingURL=Script.tests.js.map