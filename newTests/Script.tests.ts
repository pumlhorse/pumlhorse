import { pumlhorse, Script } from '../src/Script';
import { setLoggers } from '../src/loggers';
import * as Promise from 'bluebird';

describe('Script', () => {
    var loggerMocks;
    var mock;

    beforeEach(() => {
        mock = jasmine.createSpy('mock');
        loggerMocks = jasmine.createSpyObj('loggers', ['log', 'warn', 'error']);
        setLoggers(loggerMocks);
    });

    it('should display a warning when there are no steps', (done) => {
        // Arrange
        var script = getScript([]);

        // Act
        var promise = script.run();
        
        // Assert
        promise.then(() => {
            expect(loggerMocks.warn).toHaveBeenCalledWith('Script does not contain any steps');
        })
        .finally(assertPromiseResolved(promise, done));
    });

	it('does not display a warning when there is at least one test step', function (done) {
		//Arrange
		var script = getScript(['noop']);

		//Act
		var promise = script.run();

		//Assert
		promise.then(function () {
			expect(loggerMocks.warn).not.toHaveBeenCalled();
		})
        .finally(assertPromiseResolved(promise, done));
	});

	it('runs raw javascript if step is a string and not a function name', function (done) {
		//Arrange
		var script = getScript(['${noop("new value")}']);
        var noop = jasmine.createSpy('noop');
        script.addFunction('noop', noop);

		//Act
		var promise = script.run();

		//Assert
		promise.then(() => {
			expect(noop).toHaveBeenCalledWith('new value');
		})
        .finally(assertPromiseResolved(promise, done));
	});

	it('does not run a function with parameters if it doesnt exist', function (done) {
		//Arrange
		var script = getScript([{
				doesNotExistFunc: {
					var1: "x"
				}
			}]);

		//Act
		var promise = script.run();

		//Assert
		promise.catch((err) => {
            expect(err).toBe('Function "doesNotExistFunc" does not exist');
		})
        .finally(assertPromiseRejected(promise, done));
	});
    
    describe('with parameters', () => {
        it('passes parameters to function', (done) => {
            // Arrange
            function testWithParameters(var1, var2, var3) { mock(var1, var2, var3); }
			let testObj = { f: 3 };
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
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith('var1', 2, testObj);
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('accepts complex parameters', (done) => {
            // Arrange
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
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith({ innerVal: 4 });
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('passes undefined for missing parameters', (done) => {
            // Arrange
            function testMissing(var1) { mock(var1); }
            var script = getScript([
                {
                    'testMissing': {
                        var3: 'ignored'
                    }
                }
            ]);
            script.addFunction('testMissing', testMissing);
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith(undefined);
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('accepts variables in parameters', (done) => {
            // Arrange
            function testParameterWithVariable(var1) { mock(var1); }
            var script = getScript([
                {
                    'testParameterWithVariable': {
                        var1: '${3 * 7}'
                    }
                }
            ]);
            script.addFunction('testParameterWithVariable', testParameterWithVariable);
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith(21);
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('handles complex object variables in parameters', (done) => {
            // Arrange
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
            script.addFunction('returnComplexObj', () => complexObj);
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith(144);
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('allows variables inside string literals', (done) => {
            // Arrange
            var script = getScript([
                'url = http://example.org',
                {
                    'testStringLiteral': 'String literal with $url/somePath here'
                }
            ]);
            script.addFunction('testStringLiteral', function (var1) { mock(var1); });
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith('String literal with http://example.org/somePath here');
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('persists complex type information in variables', (done) => {
            // Arrange
            var dt = new Date()
            var script = getScript([
				'date = returnDate',
				{
					testObj: '$date'
				}
            ]);
            script.addFunction('returnDate', () => dt);
            script.addFunction('testObj', function (var1) { mock(var1); });
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith(dt);
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('handles assignment for values that are promises', (done) => {
            // Arrange
            var deferred = Promise.resolve('promise value');
            var script = getScript([
				'p = returnPromise',
				{
					testObj: '$p'
				}
            ]);
            script.addFunction('returnPromise', () => deferred);
            script.addFunction('testObj', function (var1) { mock(var1); });
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith('promise value');
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('passes simple arguments items for anonymous parameter', (done) => {
            // Arrange
            var func = function (val) {
				mock(val);
			}
			func['__alias'] = ['@'];
            var script = getScript([
				{
					testWithAnonymousParameter: 456
				}
            ]);
            script.addFunction('testWithAnonymousParameter', func);
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith(456);
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('passes complex arguments items for anonymous parameter', (done) => {
            // Arrange
            var func = function (val) {
				mock(val);
			}
			func['__alias'] = ['@'];
			func['__passAsObject'] = true;
            var script = getScript([
				{
					testWithAnonymousParameter: {
						testVal: 456,
						complex: { val: "here"}
					}
				}
            ]);
            script.addFunction('testWithAnonymousParameter', func);
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith({
						testVal: 456,
						complex: { val: "here"}
					});
			})
            .finally(assertPromiseResolved(promise, done));
        });
    });

    describe('Assignment', () => {

        it('assigns value if value is not a function', (done) => {
            // Arrange
            var script = getScript([
                'val1 = some-test-string',
                {
                    noop: {
                        value: '$val1'
                    }
                }
            ]);
            script.addFunction('noop', (value) => mock(value));
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith('some-test-string');
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('assigns value containing equal sign', (done) => {
            // Arrange
            var script = getScript([
                'val1 = db=something;connection=false',
                {
                    noop: {
                        value: '$val1'
                    }
                }
            ]);
            script.addFunction('noop', (value) => mock(value));
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith('db=something;connection=false');
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('assigns null function result to variable', (done) => {
            // Arrange
            var script = getScript([
                'val1 = returnNull',
                {
                    noop: {
                        value: '$val1'
                    }
                }
            ]);
            script.addFunction('returnNull', (value) => null);
            script.addFunction('noop', (value) => mock(value));
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith(null);
			})
            .finally(assertPromiseResolved(promise, done));
        });

    });

    describe('with context', () => {

        it('allows a null context', (done) => {
            // Arrange
            var script = getScript([
                'noop'
            ]);
            script.addFunction('noop', (value) => mock(value));
            
            // Act
            var promise = script.run(null);
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalled();
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('allows a context passed in', (done) => {
            // Arrange
            var script = getScript([
                {
                    doThing: {
                        someVal: '$val1',
                        someOtherVal: '$val2'
                    }
                }
            ]);
            script.addFunction('doThing', (someVal, someOtherVal) => mock(someVal, someOtherVal));
            
            // Act
            var promise = script.run({
                val2: 'second value',
                val1: 'first value'
            });
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith('first value', 'second value');
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('allows a complex context', (done) => {
            // Arrange
            var script = getScript([
                {
                    doThing: {
                        someVal: '$val1.nested.val',
                    }
                }
            ]);
            script.addFunction('doThing', (someVal) => mock(someVal));
            
            // Act
            var promise = script.run({
                val1: {
                    nested: {
                        val: 'abcd'
                    }
                }
            });
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith('abcd');
			})
            .finally(assertPromiseResolved(promise, done));
        });

    });

    describe('with modules', () => {

        it('throws an error if module doesnt exist', (done) => {
            // Arrange
                        
            // Act
            var promise = Promise.method(() => 
                new Script({
                    name: 'test script',
                    modules: ['badModule'],
                    steps: ['noop']
                }))();
            
            // Assert
			promise.catch(function (err) {
                expect(err.message).toBe('Module "badModule" does not exist');
                expect(mock).not.toHaveBeenCalled();
			})
            .finally(assertPromiseRejected(promise, done));
        });

        it('uses a valid module', (done) => {
            // Arrange
            pumlhorse.module('goodModule')
                .function('sayHello', () => mock());
            var script = new Script({
                    name: 'test script',
                    modules: ['goodModule'],
                    steps: ['sayHello']
            });
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalled();
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('allows namespaces for modules', (done) => {
            // Arrange
            pumlhorse.module('goodModule')
                .function('sayHello', () => mock());
            var script = new Script({
                    name: 'test script',
                    modules: ['myModule = goodModule'],
                    steps: ['myModule.sayHello']
            });
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalled();
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('provides the correct scope to namespaced modules', (done) => {
            // Arrange
            pumlhorse.module('goodModule')
                .function('sayHello', function () { mock(this); });
            var script = new Script({
                    name: 'test script',
                    modules: ['myModule = goodModule'],
                    steps: ['myModule.sayHello']
            });
            
            // Act
            var promise = script.run({ someVal: 321 });
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith(jasmine.objectContaining({
                    $emit: jasmine.any(Function),
                    someVal: 321
                }));
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('provides the correct scope to namespaced modules with parameters', (done) => {
            // Arrange
            pumlhorse.module('goodModule')
                .function('sayHello', function (param1, param2) { mock(this, param1, param2); });
            var script = new Script({
                    name: 'test script',
                    modules: ['myModule = goodModule'],
                    steps: [{'myModule.sayHello': { param1: 11, param2: 22}}]
            });
            
            // Act
            var promise = script.run({ someVal: 321 });
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalledWith(jasmine.objectContaining({
                    $emit: jasmine.any(Function),
                    someVal: 321
                }), 11, 22);
			})
            .finally(assertPromiseResolved(promise, done));
        });

        it('allows a module to access another module through $module', (done) => {
            // Arrange
            pumlhorse.module('goodModule')
                .function('sayHello', function () { mock(); });
            pumlhorse.module('otherModule')
                .function('callOtherModule', () => {
                    var scope = this;
                    scope.$module('goodModule').sayHello();
                })
            var script = new Script({
                name: 'test script',
                modules: ['myModule = goodModule', 'otherModule'],
                steps: ['callOtherModule']
            });
            
            // Act
            var promise = script.run();
            
            // Assert
			promise.then(function () {
                expect(mock).toHaveBeenCalled();
			})
            .finally(assertPromiseResolved(promise, done));
        });

    })

});

function getScript(steps: any[]): Script {
    return new Script({
        name: 'test script',
        steps: steps
    });
}

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