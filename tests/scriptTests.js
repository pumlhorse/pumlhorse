jasmine.DEFAULT_TIMEOUT_INTERVAL = 300;
var Script = require("../lib/script.js")
var loggers = require("../lib/loggers.js")
var Promise = require("bluebird")
var filters = require("../lib/filters.js")

var loggerMocks = {
    warn: function () {},
    error: function () {},
    log: function () {}
}


describe("Run Script", function () {
		
    var promiseResult;
	beforeEach(function() {
        functions = {};
		addFunction("noop", function() {});
        promiseResult = jasmine.createSpy("result");
        loggers.setLoggers(loggerMocks)
	});

	it("displays a warning when there are no steps", function (done) {
		//Arrange
		spyOn(loggerMocks, "warn");

		var test = getScript([]);

		//Act
		var promise = test.run();

		//Assert
		promise.then(function() {
			expect(loggerMocks.warn).toHaveBeenCalledWith("Script does not contain any steps");
		})
        .finally(assertPromiseResolved(promise, done));
	});

	it("does not display a warning when there is at least one test step", function (done) {
		//Arrange
		spyOn(loggerMocks, "warn");

		var test = getScript(["noop"]);

		//Act
		var promise = test.run();

		//Assert
		promise.then(function () {
			expect(loggerMocks.warn).not.toHaveBeenCalled();
		})
        .finally(assertPromiseResolved(promise, done));
	});

	it("runs raw javascript if step is a string and not a function name", function (done) {
		//Arrange
		spyOn(functions, "noop");
		var test = getScript(["${noop('new value')}"]);

		//Act
		var promise = test.run();

		//Assert
		promise.then(function () {
			expect(functions.noop).toHaveBeenCalledWith("new value");
		})
        .finally(assertPromiseResolved(promise, done));
	});

	it("does not run a function with parameters if it doesn't exist", function (done) {
		//Arrange
		var isCalled = false;
		var test = getScript([
			{
				testFunc: {
					var1: "x"
				}
			}
		]);

		//Act
		var promise = test.run();

		//Assert
		promise.catch(function() {
			expect(isCalled).toBe(false);
		})
        .finally(assertPromiseRejected(promise, done));
	});

	it("runs a custom function if it exists", function (done) {
		var isCalled = false;
		addFunction("testFunc", function () {
			isCalled = true;
		});
		var test = getScript(["testFunc"]);

		//Act
		var promise = test.run();

		//Assert
		promise.then(function () {
			expect(isCalled).toBe(true);
		})
        .finally(assertPromiseResolved(promise, done));
	});

	describe("with parameters", function () {

		it("passes parameters to function", function (done) {
			//Arrange
			var output = {};
			addFunction("testWithParameters", function (var1, var2, var3) {
				output = { var1: var1, var2: var2, var3: var3 };
			});
			var testObj = { f: 3 };
			var test = getScript([
				{
					"testWithParameters": {
						var1: "var1",
						var3: testObj,
						var2: 2
					}
				}
			]);

			//Act
			var promise = test.run();

			//Assert
			promise.then(function () {
				expect(output.var1).toBe("var1");
				expect(output.var2).toBe(2);
				expect(output.var3).toEqual(testObj);
			})
            .finally(assertPromiseResolved(promise, done));
		});


		it("accepts complex parameters", function (done) {
			//Arrange
			var output = {};
			addFunction("testComplex", function (var1) {
				output = { var1: var1 };
			});
			var test = getScript([
				{
					"testComplex": {
						var1: {
							innerVal: "${2 + 2}"
						}
					}
				}
			]);

			//Act
			var promise = test.run();

			//Assert
			promise.then(function () {
				expect(output.var1.innerVal).toBe(4);
			})
            .finally(assertPromiseResolved(promise, done));
		});

		it("passes undefined for missing parameters", function (done) {
			//Arrange
			var calledVar1;
			addFunction("testWithMissingParameters", function (var1) {
				calledVar1 = var1;
			});
			var test = getScript([
				{
					"testWithMissingParameters": {
						var3: 2,
					}
				}
			]);

			//Act
			var promise = test.run();

			//Assert
			promise.then(function() {
				expect(calledVar1).toBe(undefined);
			})
        .finally(assertPromiseResolved(promise, done));
		});

		it("accepts variables in parameters", function (done) {
			//Arrange
			var input = {};
			addFunction("testParameterWithVariable", function (var1) {
				input.var1 = var1;
			});
			var test = getScript([
				{
					"testParameterWithVariable": {
						var1: "${3 * 7}"
					}
				}
			]);

			//Act
			var promise = test.run();

			//Assert
			promise.then(function() {
				expect(input.var1).toBe(21);
			})
        .finally(assertPromiseResolved(promise, done));
		});

		it("handles complex object variables in parameters", function(done) {
			//Arrange
			var input = {};
			addFunction("returnComplexObj", function() {
				return { nested: { val: 144 } };
			});
			addFunction("testComplexParameter", function(var1) {
				input.var1 = var1;
			});
			var test = getScript([
				"complexObj = returnComplexObj",
				{
					testComplexParameter: {
						var1: "$complexObj.nested.val"
					}
				}
			]);

			//Act
			var promise = test.run();

			//Assert
			promise.then(function() {
				expect(input.var1).toBe(144);
			})
            .finally(assertPromiseResolved(promise, done));
		});

		it("allows for variables inside string literals", function(done) {
			//Arrange
            spyOn(loggerMocks, "log")
			var test = getScript([
                "url = http://example.org",
				{
					log: "String literal with $url/somePath here"
				}
			]);

			//Act
			var promise = test.run();

			//Assert
			promise.then(function() {
				expect(loggerMocks.log).toHaveBeenCalledWith("String literal with http://example.org/somePath here")
			})
            .finally(assertPromiseResolved(promise, done));
		});
        
        it("persists complex type information in variables", function (done) {
            //Arrange
			var input = {};
            var dt = new Date()
			addFunction("returnDate", function() {
				return dt;
			});
			var test = getScript([
				"date = returnDate",
				{
					log: "$date"
				}
			]);
            spyOn(loggerMocks, "log")

			//Act
			var promise = test.run();

			//Assert
			promise.then(function() {
				expect(loggerMocks.log).toHaveBeenCalledWith(dt)
			})
            .finally(assertPromiseResolved(promise, done));
        });
        
        it("handles assignment for values that are promises", function (done) {
            //Arrange
            spyOn(loggerMocks, "log")
            var deferred = Promise.resolve("promise value")
            addFunction("returnPromise", function() {
				return deferred;
			});
			var test = getScript([
				"complexObj = returnPromise",
				{
					log: ["$complexObj"]
				}
			]);

			//Act
			var promise = test.run();
            
            //Assert
            promise.then(function() {
                expect(loggerMocks.log).toHaveBeenCalledWith("promise value");
            })
            .finally(assertPromiseResolved(promise, done));
        });
        
	});

	describe("Functions", function() {

		it("calls function if it is recognized", function (done) {
			//Arrange
			var isCalled;
			addFunction("recognizedFunction", function() {
				isCalled = true;
			});
			var test = getScript([
				"recognizedFunction"
			]);

			//Act
			var promise = test.run();

			//Assert
			promise.then(function() {
					expect(isCalled).toBe(true);
			})
            .finally(assertPromiseResolved(promise, done));
		});

		it("accepts function parameters", function(done) {
			//Arrange
			var input = {};
			addFunction("funcWithParameters", function (a, b) {
				input.a = a;
				input.b = b;
			});
			var test = getScript([
				{ "funcWithParameters": {
					a: 123,
					b: "second parameter"
				}}
			]);

			//Act
			var promise = test.run();

			//Assert
			promise.then(function() {
					expect(input.a).toBe(123);
					expect(input.b).toBe("second parameter");
					
				})
            .finally(assertPromiseResolved(promise, done));
		});
	});

	describe("Assignment", function() {

		it("assigns function result to variable", function(done) {
			//Arrange
			addFunction("returnFour", function () { return 4; });
			var input = {};
			addFunction("acceptVal", function (val) { input.val = val; });
			var test = getScript([
				"val1 = returnFour",
				{
					acceptVal: {
						val: "$val1"
					}
				}
			]);

			//Act
			var promise = test.run();

			//Assert
			promise.then(function() {
				expect(input.val).toBe(4);
				
			})
            .finally(assertPromiseResolved(promise, done));
		});

		it("assigns value if value is not a function", function(done) {
			//Arrange
			var echoVal;
			addFunction("echo", function(value) {
				echoVal = value;
			});
			var test = getScript([
				"val1 = some-test-string",
				{
					echo: {
						value: "$val1"
					}
				}
			]);

			//Act
			var promise = test.run();

			//Assert
			promise.then(function() {
					expect(echoVal).toBe("some-test-string");
					
				})
            .finally(assertPromiseResolved(promise, done));

		});

		it("assigns value with equal sign in it", function(done) {
			//Arrange
			var echoVal;
			addFunction("echo", function(value) {
				echoVal = value;
			});
			var test = getScript([
				"val1 = db=something;connection=false",
				{
					echo: {
						value: "$val1"
					}
				}
			]);

			//Act
			var promise = test.run();

			//Assert
			promise.then(function() {
					expect(echoVal).toBe("db=something;connection=false");
					
				})
            .finally(assertPromiseResolved(promise, done));

		});

		it("assigns null function result to variable", function (done) {
			//Arrange
			addFunction("returnNull", function () { return null; });
			var input = {};
			addFunction("acceptVal", function (val) { input.val = val; });
			var test = getScript([
				"val1 = returnNull",
				{
					acceptVal: {
						val: "$val1"
					}
				}
			]);

			//Act
			var promise = test.run();

			//Assert
			promise.then(function () {
				expect(input.val).toBe(null);
				
			})
            .finally(assertPromiseResolved(promise, done));
		});
	});

    describe("with context", function () {
        it("allows a null context", function (done) {
            //Arrange
            var test = getScript([
                "noop"
            ])
            
            //Act
            var promise = test.run(null)
            
            //Assert
            promise.finally(assertPromiseResolved(promise, done))
            
        });
        
        it("uses a context passed in", function (done) {
            //Arrange
            var passedParams = {};
            addFunction("doThing", function (someVal, someOtherVal) {
                passedParams.someVal = someVal;
                passedParams.someOtherVal = someOtherVal
            })
            var test = getScript([
                {
                    doThing: {
                        someVal: "$val1",
                        someOtherVal: "$val2"
                    }
                }
            ])
            
            //Act
            var promise = test.run({
                val2: "second value",
                val1: "first value"
            })
            
            //Assert
            promise.then(function () {
                expect(passedParams.someVal).toBe("first value")
                expect(passedParams.someOtherVal).toBe("second value")
            })
            .finally(assertPromiseResolved(promise, done))            
        });
        
    })
    
    describe("with modules", function () {
        it("throws an error if module doesn't exist", function (done) {
            //Arrange
            var script = new Script({
                modules: ["badModule"],
                steps: [{log:"Hello"}]
            });
            
            //Act
            var promise = Promise.method(script.run)();
            
            //Assert
            promise.catch(function (err) {
                expect(err.message).toBe("Module 'badModule' does not exist")
            })
            .finally(assertPromiseRejected(promise, done))
        });
        
        it("uses a valid module", function (done) {
            //Arrange
            var wasCalled = false
            var m = {
                sayHello: function () { 
                    wasCalled = true
                }
            }
            pumlhorse.module("goodModule")
                .function("sayHello", m.sayHello)
            var script = new Script({
                modules: ["goodModule"],
                steps: ["sayHello"]
            });
            
            //Act
            var promise = script.run();
            
            //Assert
            promise.then(function () {
                expect(wasCalled).toBe(true)
            })
            .finally(assertPromiseResolved(promise, done))
        });
        
        it("allows namespaces for modules", function (done) {
            //Arrange
            var helloSpy = jasmine.createSpy("hello")
            pumlhorse.module("goodModule")
                .function("sayHello", helloSpy)
            var script = new Script({
                modules: ["myModule = goodModule"],
                steps: ["myModule.sayHello"]
            });
            
            //Act
            var promise = script.run();
            
            //Assert
            promise.then(function () {
                expect(helloSpy).toHaveBeenCalled()
            })
            .finally(assertPromiseResolved(promise, done))
        });
        
        it("allows a module to access another module through $module", function (done) {
            //Arrange
            var helloSpy = jasmine.createSpy("hello")
            pumlhorse.module("goodModule")
                .function("sayHello", helloSpy);
            pumlhorse.module("otherModule")
                .function("callOtherModule", function () {
                    var scope = this;
                    scope.$module("goodModule").sayHello()
                })
            var script = new Script({
                modules: [
                    "myModule = goodModule",
                    "otherModule"
                    ],
                steps: ["callOtherModule"]
            });
            
            //Act
            var promise = script.run();
            
            //Assert
            promise.then(function () {
                expect(helloSpy).toHaveBeenCalled()
            })
            .finally(assertPromiseResolved(promise, done))
        });
        
    })
    
    describe("with cleanup tasks", function () {
        
        it("runs a cleanup task at the end of a script", function (done) {
            //Arrange
            spyOn(loggerMocks, "log")
            var script = new Script({
                steps: [
                    {log: "Step 1"},
                    {log: "Step 2"}
                ],
                cleanup: [
                    {log: "Cleanup step"}
                ]
            })
            
            //Act
            var promise = script.run();
            
            //Assert
            promise.then(function () {
                expect(loggerMocks.log).toHaveBeenCalledWith("Step 1")
                expect(loggerMocks.log).toHaveBeenCalledWith("Step 2")
                expect(loggerMocks.log).toHaveBeenCalledWith("Cleanup step")
            })
            .finally(assertPromiseResolved(promise, done))
        });
        
        it("runs a cleanup task even if a step failed", function (done) {
            //Arrange
            spyOn(loggerMocks, "log")
            var script = new Script({
                steps: [
                    {log: "Step 1"},
                    "throwException",
                    {log: "Step 2"}
                ],
                cleanup: [
                    {log: "Cleanup step"}
                ]
            })
            script.addFunction("throwException", function () {
                throw new Error("Oops!")
            })
            
            //Act
            var promise = script.run();
            
            //Assert
            promise.catch(function (ex) {
                expect(ex.message).toBe("Oops!")
                expect(loggerMocks.log).toHaveBeenCalledWith("Step 1")
                expect(loggerMocks.log).not.toHaveBeenCalledWith("Step 2")
                expect(loggerMocks.log).toHaveBeenCalledWith("Cleanup step")
            })
            .finally(assertPromiseRejected(promise, done))
        });
        
        it("continues running cleanup tasks even if one fails", function (done) {
            //Arrange
            spyOn(loggerMocks, "log")
            var script = new Script({
                steps: [
                    {log: "Step 1"},
                    "throwException",
                    {log: "Step 2"}
                ],
                cleanup: [
                    {log: "Cleanup step1"},
                    "throwException",
                    {log: "Cleanup step2"}
                ]
            })
            script.addFunction("throwException", function () {
                throw new Error("Oops!")
            })
            
            //Act
            var promise = script.run();
            
            //Assert
            promise.catch(function (ex) {
                expect(ex.message).toBe("Oops!")
                expect(loggerMocks.log).toHaveBeenCalledWith("Step 1")
                expect(loggerMocks.log).not.toHaveBeenCalledWith("Step 2")
                expect(loggerMocks.log).toHaveBeenCalledWith("Cleanup step1")
                expect(loggerMocks.log).toHaveBeenCalledWith("Cleanup step2")
            })
            .finally(assertPromiseRejected(promise, done))
        });
        
        it("exposes a method in the scope to add a cleanup task", function (done) {
            //Arrange
            spyOn(loggerMocks, "log")
            var script = new Script({
                steps: [
                    "methodWithCleanup"
                ]
            })
            script.addFunction("methodWithCleanup", function () {
                var scope = this;
                scope.$cleanup(function () {
                    loggerMocks.log("This is in cleanup")
                })
            })
            
            //Act
            var promise = script.run();
            
            //Assert
            promise.then(function () {
                expect(loggerMocks.log).toHaveBeenCalledWith("This is in cleanup")
            })
            .finally(assertPromiseResolved(promise, done))
        });
        
    })
	
	describe("with filters", function () {
        it("runs filters for starting and finishing script", function (done) {
            //Arrange
			spyOn(filters, "onScriptStarting").and.callThrough()
			spyOn(filters, "onScriptFinished").and.callThrough()
            spyOn(loggerMocks, "log")
            var script = new Script({
				id: "scriptid4567",				
                steps: [
                    {log: "Step 1"}
                ]
            })
            
            //Act
            var promise = script.run();
            
            //Assert
            promise.then(function () {
				expect(filters.onScriptStarting).toHaveBeenCalledWith(jasmine.objectContaining({
					id: "scriptid4567"
				}))
                expect(loggerMocks.log).toHaveBeenCalledWith("Step 1")
                expect(filters.onScriptFinished).toHaveBeenCalledWith(jasmine.objectContaining({
					id: "scriptid4567"
				}), true)
            })
            .finally(assertPromiseResolved(promise, done))
        });
		
        it("returns error if filters returns error", function (done) {
            //Arrange
			spyOn(filters, "onScriptStarting").and.returnValue(Promise.reject())
			spyOn(filters, "onScriptFinished").and.callThrough()
            spyOn(loggerMocks, "log")
            var script = new Script({
				id: "scriptid4567",
                steps: [
                    {log: "Step 1"}
                ]
            })
            
            //Act
            var promise = script.run();
            
            //Assert
            promise.catch(function () {
                expect(loggerMocks.log).not.toHaveBeenCalled()
                expect(filters.onScriptFinished).toHaveBeenCalledWith(jasmine.objectContaining({
					id: "scriptid4567"
				}), false)
            })
            .finally(assertPromiseRejected(promise, done))
        });
	})
});

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


var functions = {};
function addFunction(name, func) {
    functions[name] = func
}

function getScript(steps) {
    var script = new Script({
        steps: steps
    });
    
    for(var x in functions) {
        script.addFunction(x, functions[x])
    }
    
    return script
}