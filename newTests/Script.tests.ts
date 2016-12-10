import { pumlhorse, Script } from '../src/Script';
import { setLoggers } from '../src/loggers';

describe('Script', () => {
    var loggerMocks;
    var mock;

    beforeEach(() => {
        mock = jasmine.createSpy('mock');
        loggerMocks = jasmine.createSpyObj('loggers', ['log', 'warn', 'error']);
        setLoggers(loggerMocks);
    });


    function testAsync(runAsync) {
        return (done) => {
            runAsync().then(done, e => { fail(e); done(); });
        };
    }

    it('should display a warning when there are no steps', testAsync(async () => {
        // Arrange
        var script = getScript([]);

        // Act
        await script.run();
        
        // Assert
        expect(loggerMocks.warn).toHaveBeenCalledWith('Script does not contain any steps');
    }));

	it('does not display a warning when there is at least one test step', testAsync(async () => {
		//Arrange
		var script = getScript(['noop']);

		//Act
		await script.run();

		//Assert
        expect(loggerMocks.warn).not.toHaveBeenCalled();
	}));

	it('runs raw javascript if step is a string and not a function name', testAsync(async () => {
		//Arrange
		var script = getScript(['${noop("new value")}']);
        var noop = jasmine.createSpy('noop');
        script.addFunction('noop', noop);

		//Act
		await script.run();

		//Assert
		expect(noop).toHaveBeenCalledWith('new value');
	}));

	it('does not run a function with parameters if it doesnt exist', testAsync(async () => {
		//Arrange
		var script = getScript([{
            doesNotExistFunc: {
                var1: "x"
            }
        }]);

        try {
            //Act
            await script.run();
            fail();
        }
        catch (err) {
            //Assert
            expect(err.message).toBe('Function "doesNotExistFunc" does not exist');
        }
	}));
    
    describe('with parameters', () => {
        it('passes parameters to function',testAsync(async () => {
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
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith('var1', 2, testObj);
			
        }));

        it('accepts complex parameters',testAsync(async () => {
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
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith({ innerVal: 4 });
			
        }));

        it('passes undefined for missing parameters',testAsync(async () => {
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
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith(undefined);
			
        }));

        it('accepts variables in parameters',testAsync(async () => {
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
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith(21);
			
        }));

        it('handles complex object variables in parameters',testAsync(async () => {
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
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith(144);
        }));

        it('allows variables inside string literals',testAsync(async () => {
            // Arrange
            var script = getScript([
                'url = http://example.org',
                {
                    'testStringLiteral': 'String literal with $url/somePath here'
                }
            ]);
            script.addFunction('testStringLiteral', function (var1) { mock(var1); });
            
            // Act
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith('String literal with http://example.org/somePath here');
			
        }));

        it('persists complex type information in variables',testAsync(async () => {
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
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith(dt);
			
        }));

        it('handles assignment for values that are promises',testAsync(async () => {
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
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith('promise value');
			
        }));

        it('passes simple arguments items for anonymous parameter',testAsync(async () => {
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
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith(456);
			
        }));

        it('passes complex arguments items for anonymous parameter',testAsync(async () => {
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
            await script.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith({
                testVal: 456,
                complex: { val: "here"}
            });
        }));
    });

    describe('Assignment', () => {

        it('assigns value if value is not a function',testAsync(async () => {
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
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith('some-test-string');
        }));

        it('assigns value containing equal sign',testAsync(async () => {
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
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith('db=something;connection=false');
        }));

        it('assigns null function result to variable',testAsync(async () => {
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
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith(null);
        }));

    });

    describe('with context', () => {

        it('allows a null context',testAsync(async () => {
            // Arrange
            var script = getScript([
                'noop'
            ]);
            script.addFunction('noop', (value) => mock(value));
            
            // Act
            await script.run(null);
            
            // Assert
			expect(mock).toHaveBeenCalled();
        }));

        it('allows a context passed in',testAsync(async () => {
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
            await script.run({
                val2: 'second value',
                val1: 'first value'
            });
            
            // Assert
			expect(mock).toHaveBeenCalledWith('first value', 'second value');
        }));

        it('allows a complex context',testAsync(async () => {
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
            await script.run({
                val1: {
                    nested: {
                        val: 'abcd'
                    }
                }
            });
            
            // Assert
			expect(mock).toHaveBeenCalledWith('abcd');
        }));

    });

    describe('with modules', () => {

        it('throws an error if module doesnt exist',testAsync(async () => {
            // Arrange

            try {
                //Act
                var script = new Script({
                    name: 'test script',
                    modules: ['badModule'],
                    steps: ['noop']
                });
                fail();
            }
            catch (err) {
                //Assert
                expect(err.message).toBe('Module "badModule" does not exist');
                expect(mock).not.toHaveBeenCalled();
            }
        }));

        it('uses a valid module',testAsync(async () => {
            // Arrange
            pumlhorse.module('goodModule')
                .function('sayHello', () => mock());
            var script = new Script({
                    name: 'test script',
                    modules: ['goodModule'],
                    steps: ['sayHello']
            });
            
            // Act
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalled();
        }));

        it('allows namespaces for modules',testAsync(async () => {
            // Arrange
            pumlhorse.module('goodModule')
                .function('sayHello', () => mock());
            var script = new Script({
                    name: 'test script',
                    modules: ['myModule = goodModule'],
                    steps: ['myModule.sayHello']
            });
            
            // Act
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalled();
        }));

        it('provides the correct scope to namespaced modules',testAsync(async () => {
            // Arrange
            pumlhorse.module('goodModule')
                .function('sayHello', function () { mock(this); });
            var script = new Script({
                    name: 'test script',
                    modules: ['myModule = goodModule'],
                    steps: ['myModule.sayHello']
            });
            
            // Act
            await script.run({ someVal: 321 });
            
            // Assert
			expect(mock).toHaveBeenCalledWith(jasmine.objectContaining({
                $emit: jasmine.any(Function),
                someVal: 321
            }));
        }));

        it('provides the correct scope to namespaced modules with parameters',testAsync(async () => {
            // Arrange
            pumlhorse.module('goodModule')
                .function('sayHello', function (param1, param2) { mock(this, param1, param2); });
            var script = new Script({
                    name: 'test script',
                    modules: ['myModule = goodModule'],
                    steps: [{'myModule.sayHello': { param1: 11, param2: 22}}]
            });
            
            // Act
            await script.run({ someVal: 321 });
            
            // Assert
            expect(mock).toHaveBeenCalledWith(jasmine.objectContaining({
                $emit: jasmine.any(Function),
                someVal: 321
            }), 11, 22);
        }));

        it('allows a module to access another module through $module',testAsync(async () => {
            // Arrange
            pumlhorse.module('goodModule')
                .function('sayHello', function () { mock(); });
            pumlhorse.module('otherModule')
                .function('callOtherModule', function() {
                    var scope = this;
                    scope.$module('goodModule').sayHello();
                });
            var script = new Script({
                name: 'test script',
                modules: ['myModule = goodModule', 'otherModule'],
                steps: ['callOtherModule']
            });
            
            // Act
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalled();
        }));
    });

    describe('with cleanup tasks', () => {
        it('runs a cleanup task at the end of a script',testAsync(async () => {
            // Arrange
            var script = new Script({
                name: 'test script',
                steps: [
                    {log: 'step 1'},
                    {log: 'step 2'},
                ],
                cleanup: [
                    {log: 'cleanup step'}
                ]
            });
            
            // Act
            await script.run();
            
            // Assert
            expect(loggerMocks.log).toHaveBeenCalledWith('step 1');
            expect(loggerMocks.log).toHaveBeenCalledWith('step 2');
            expect(loggerMocks.log).toHaveBeenCalledWith('cleanup step');
        }));
        
        it('runs a cleanup task even if a step failed',testAsync(async () => {
            // Arrange
            var script = new Script({
                name: 'test script',
                steps: [
                    {log: 'step 1'},
                    'throwException',
                    {log: 'step 2'},
                ],
                cleanup: [
                    {log: 'cleanup step'}
                ]
            });
            script.addFunction('throwException', function () {
                throw new Error('Oops!');
            });
            
            
            try {
                //Act
                await script.run();
                fail();
            }
            catch (ex) {
                //Assert
                expect(ex.message).toBe('Oops!');
                expect(loggerMocks.log).toHaveBeenCalledWith('step 1');
                expect(loggerMocks.log).not.toHaveBeenCalledWith('step 2');
                expect(loggerMocks.log).toHaveBeenCalledWith('cleanup step');
            }			
        }));
        
        it('runs a cleanup task even if one failed',testAsync(async () => {
            // Arrange
            var script = new Script({
                name: 'test script',
                steps: [
                    {log: 'step 1'},
                    'throwException',
                    {log: 'step 2'},
                ],
                cleanup: [
                    {log: 'cleanup step1'},
                    'throwException',
                    {log: 'cleanup step2'}
                ]
            });
            script.addFunction('throwException', function () {
                throw new Error('Oops!');
            });
            
            try {
                //Act
                await script.run();
                fail();
            }
            catch (ex) {
                //Assert
                expect(ex.message).toBe('Oops!');
                expect(loggerMocks.log).toHaveBeenCalledWith('step 1');
                expect(loggerMocks.log).not.toHaveBeenCalledWith('step 2');
                expect(loggerMocks.log).toHaveBeenCalledWith('cleanup step1');
                expect(loggerMocks.log).toHaveBeenCalledWith('cleanup step2');
            }
        }));
        
        it('exposes a method in the scope to add a cleanup task',testAsync(async () => {
            // Arrange
            var script = getScript([
                    'methodWithCleanup'
                ]);
            script.addFunction('methodWithCleanup', function () {
                var scope = this;
                scope.$cleanup(() => mock('this is in cleanup'));
            });
            
            // Act
            await script.run();
            
            // Assert
			expect(mock).toHaveBeenCalledWith('this is in cleanup');
        }));
        
        it('runs cleanup tasks in reverse order',testAsync(async () => {
            // Arrange
            var script = getScript([
                    'methodWithCleanup',
                    'methodWithCleanup',
                    'methodWithCleanup'
                ]);
            var arr = [];
            var i = 0;
            script.addFunction('methodWithCleanup', function () {
                var scope = this;
                var num = i++;
                scope.$cleanup(() => arr.push(num));
            });
            
            // Act
            await script.run();
            
            // Assert
            expect(arr[0]).toBe(2);
            expect(arr[1]).toBe(1);
            expect(arr[2]).toBe(0);
        }));
        
        it('allows cleanup tasks to be prepended',testAsync(async () => {
            // Arrange
            var script = getScript([
                    'methodWithCleanup',
                    'methodWithCleanup',
                    'methodWithCleanup'
                ]);
            var arr = [];
            var i = 0;
            script.addFunction('methodWithCleanup', function () {
                var scope = this;
                var num = i++;
                scope.$cleanupAfter(() => arr.push(num));
            });
            
            // Act
            await script.run();
            
            // Assert
            expect(arr[0]).toBe(0);
            expect(arr[1]).toBe(1);
            expect(arr[2]).toBe(2);			
        }));
    });

    describe('with steps', () => {
        describe('with no declared parameters', () => {
            it('handles zero parameters',testAsync(async () => {
                // Arrange
                var script = getScript([
                        'noParam'
                    ]);
                script.addFunction('noParam', mock);
                
                // Act
                await script.run();
                
                // Assert
                expect(mock).toHaveBeenCalled();
            }));

            it('handles a string parameter',testAsync(async () => {
                // Arrange
                var script = getScript([
                        { noParam: 'a value' }
                    ]);
                script.addFunction('noParam', mock);
                
                // Act
                await script.run();
                
                // Assert
                expect(mock).toHaveBeenCalledWith('a value');
            }));
            
            it('handles an array parameter',testAsync(async () => {
                // Arrange
                var script = getScript([
                        { noParam: ['val1', 'val2'] }
                    ]);
                script.addFunction('noParam', mock);
                
                // Act
                await script.run();
                
                // Assert
                expect(mock).toHaveBeenCalledWith('val1', 'val2');
            }));
            
            it('handles a variable parameter',testAsync(async () => {
                // Arrange
                var script = getScript([
                        { noParam: '$myVal' }
                    ]);
                script.addFunction('noParam', mock);
                
                // Act
                await script.run({myVal: 12345});
                
                // Assert
                expect(mock).toHaveBeenCalledWith(12345);
            }));
            
            it('handles a variable (array) parameter',testAsync(async () => {
                // Arrange
                var script = getScript([
                        { noParam: '$myVal' }
                    ]);
                script.addFunction('noParam', mock);
                
                // Act
                await script.run({myVal: [12345, 67890]});
                
                // Assert
                expect(mock).toHaveBeenCalledWith([12345, 67890]);
            }));
            
            it('handles a function with an unnamed inline javascript parameter',testAsync(async () => {
                // Arrange
                var script = getScript([
                        { noParam: '${2 * 3}' }
                    ]);
                script.addFunction('noParam', mock);
                
                // Act
                await script.run();
                
                // Assert
                expect(mock).toHaveBeenCalledWith(6);
            }));
            
            it('handles a function with an unnamed inline javascript (array) parameter',testAsync(async () => {
                // Arrange
                var script = getScript([
                        { noParam: '${[3, 4]}' }
                    ]);
                script.addFunction('noParam', mock);
                
                // Act
                await script.run();
                
                // Assert
                expect(mock).toHaveBeenCalledWith([3, 4]);
            }));
        });
                    
        it('handles a function with a named object parameter',testAsync(async () => {
            // Arrange
            var script = getScript([
                { 
                    withParam: {
                        myVal: {
                            obj: true
                        }
                    }
                }
            ]);
            script.addFunction('withParam', function (myVal) { mock.apply(mock, arguments); });
            
            // Act
            await script.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith({obj: true});
        }));
                    
        it('handles a function with a named array parameter',testAsync(async () => {
            // Arrange
            var script = getScript([
                { 
                    withParam: {
                        myVal: [1, 2]
                    }
                }
            ]);
            script.addFunction('withParam', function (myVal) { mock.apply(mock, arguments); });
            
            // Act
            await script.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith([1, 2]);
        }));
                    
        it('handles a function with a named variable parameter',testAsync(async () => {
            // Arrange
            var script = getScript([
                { 
                    withParam: {
                        myVal: '$val'
                    }
                }
            ]);
            script.addFunction('withParam', function (myVal) { mock.apply(mock, arguments); });
            
            // Act
            await script.run({ val: 1234});
            
            // Assert
            expect(mock).toHaveBeenCalledWith(1234);
        }));
                    
        it('handles a function with a named inline javascript parameter',testAsync(async () => {
            // Arrange
            var script = getScript([
                { 
                    withParam: {
                        myVal: '${3 * 2}'
                    }
                }
            ]);
            script.addFunction('withParam', function (myVal) { mock.apply(mock, arguments); });
            
            // Act
            await script.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith(6);
        }));
                    
        it('handles a function with a named variable parameter',testAsync(async () => {
            // Arrange
            var script = getScript([
                { 
                    withParam: {
                        myVal: '$val'
                    }
                }
            ]);
            script.addFunction('withParam', function (myVal) { mock.apply(mock, arguments); });
            
            // Act
            await script.run({ val: 1234});
            
            // Assert
            expect(mock).toHaveBeenCalledWith(1234);
        }));
    });

});

function getScript(steps: any[]): Script {
    return new Script({
        name: 'test script',
        steps: steps
    });
}