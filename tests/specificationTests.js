var app = require("../lib/app.js")
var loggers = require("../lib/loggers.js")

var loggerMocks = jasmine.createSpyObj("loggers", ["log", "warn", "error"]);
        
describe("Specification tests", function () {
	
    beforeEach(function() {
        loggers.setLoggers(loggerMocks)
	});
    
    describe("with JavaScript", function () {
        it("allows inline javascript", function (done) {
            //Arrange
            var script = getScript(
                "steps:",
                "  - myMixedCase = aBcDeFg",
                "  - myLowerCase = $myMixedCase.toLowerCase()",
                "  - areEqual: ",
                "      expected: abcdefg",
                "      actual: $myLowerCase"
            )
            
            //Act
            var promise = script.run()
            
            //Assert
            promise
            .finally(assertPromiseResolved(promise, done))
        });
        
        it("allows declared javascript functions", function (done) {
            //Arrange
            var script = getScript(
                "functions:",
                "  getMyInfo: return { name: 'John Smith', age: 25 }",
                "  logMyInfo:",
                "    - age",
                "    - name", 
                "    - this.log('My name is ' + name + ' and I am ' + age + ' years old')",
                "steps:",
                "  - myInfo = getMyInfo",
                "  - logMyInfo:",
                "      name: $myInfo.name",
                "      age: $myInfo.age"
            )
            
            //Act
            var promise = script.run()
            
            //Assert
            promise.then(function () {
                expect(loggerMocks.log)
                    .toHaveBeenCalledWith("My name is John Smith and I am 25 years old")
            })
            .finally(assertPromiseResolved(promise, done))
        });
    })
    
    describe("for logging", function () {
        
        beforeEach(function () {
		    // spyOn(loggerMocks, "log");
		    // spyOn(loggerMocks, "warn");
		    // spyOn(loggerMocks, "error");
        })
        
        it("allows basic logging", function (done) {
            //Arrange
            var script = getScript(
                "steps: ",
                "  - log: log msg",
                "  - warn: warning msg",
                "  - error: error msg"
            )
            
            //Act
            var promise = script.run()
            
            promise.then(function () {
                //Assert
                expect(loggerMocks.log).toHaveBeenCalledWith("log msg")
                expect(loggerMocks.warn).toHaveBeenCalledWith("warning msg")
                expect(loggerMocks.error).toHaveBeenCalledWith("error msg")
            })
            .finally(assertPromiseResolved(promise, done))
        });
        
        it("allows logging with parameters", function (done) {
            //Arrange
            var script = getScript(
                "steps: ",
                "  - log: ",
                "      - log msg",
                "      - param1",
                "      - param2",
                "  - warn: ",
                "      - warning msg",
                "      - param1",
                "      - param2",
                "  - error: ",
                "      - error msg",
                "      - param1",
                "      - param2"
            )
            
            //Act
            var promise = script.run()
            
            promise.then(function () {
                //Assert
                expect(loggerMocks.log)
                    .toHaveBeenCalledWith("log msg", "param1", "param2")
                expect(loggerMocks.warn)
                    .toHaveBeenCalledWith("warning msg", "param1", "param2")
                expect(loggerMocks.error)
                    .toHaveBeenCalledWith("error msg", "param1", "param2")
            })
            .finally(assertPromiseResolved(promise, done))
        });
        
        it("allows $varName logging", function (done) {
            //Arrange
            var script = getScript(
                "steps: ",
                "  - myFavoriteNumber = 42",
                "  - warn: Every tech thing has to have a $myFavoriteNumber reference"
            )
            
            //Act
            var promise = script.run()
            
            promise.then(function () {
                //Assert
                expect(loggerMocks.warn)
                    .toHaveBeenCalledWith("Every tech thing has to have a 42 reference")
            })
            .finally(assertPromiseResolved(promise, done))
        });
        
        it("allows multiple variables in a single line", function (done) {
            //Arrange
            var script = getScript(
                "steps: ",
                "  - myFavoriteNumber = 42",
                "  - anotherNumber = 13",
                "  - warn: Here are two numbers: $myFavoriteNumber and $anotherNumber"
            )
            
            //Act
            var promise = script.run()
            
            promise.then(function () {
                //Assert
                expect(loggerMocks.warn)
                    .toHaveBeenCalledWith("Here are two numbers: 42 and 13")
            })
            .finally(assertPromiseResolved(promise, done))
        });
    });
        
    it("allows a function call on a variable", function (done) {
        //Arrange
        var script = getScript(
            "functions:",
            "  getDate:",
            "    - return new Date('2000-01-01 12:00:00')",
            "steps: ",
            "  - myVal = getDate",
            "  - warn: The world survived $myVal.toDateString() thanks to hard work and planning"
        )
        
        //Act
        var promise = script.run()
        
        promise.then(function () {
            //Assert
            expect(loggerMocks.warn)
                .toHaveBeenCalledWith("The world survived Sat Jan 01 2000 thanks to hard work and planning")
        })
        .finally(assertPromiseResolved(promise, done))
    });
    
    it("allows a variable function to be used as a step", function (done) {
        //Arrange
        var script = getScript(
            "steps: ",
            "  - myObj = getObject",
            "  - favoriteThings = myObj.printItems:",
            "      number: 42",
            "      color: red",
            "  - warn: $favoriteThings"
        );
        var obj = {
            printItems: (color, number) => 'My favorite color is ' + color + ' and my favorite number is ' + number
        }
        script.addFunction("getObject", () => obj);
        
        //Act
        var promise = script.run()
        
        promise.then(function () {
            //Assert
            expect(loggerMocks.warn)
                .toHaveBeenCalledWith("My favorite color is red and my favorite number is 42")
        })
        .finally(assertPromiseResolved(promise, done))
    });
    
    it("allows a function call with variables", function (done) {
        //Arrange
        var script = getScript(
            "functions:",
            "  getDate:",
            "    - return new Date('2000-01-01 12:00:00')",
            "steps: ",
            "  - myVal = getDate",
            "  - $myVal.setDate('2')",
            "  - warn: And $myVal.toDateString() was just another day"
        )
        
        //Act
        var promise = script.run()
        
        promise.then(function () {
            //Assert
            expect(loggerMocks.warn)
                .toHaveBeenCalledWith("And Sun Jan 02 2000 was just another day")
        })
        .finally(assertPromiseResolved(promise, done))
    });

    it("allows a script to be interrupted without an error", (done) => {
        //Arrange
        var script = getScript(
            "steps: ",
            "  - log: step 1",
            "  - $end",
            "  - log: step 2"
        );
        
        //Act
        var promise = script.run()
        
        promise.then(function () {
            //Assert
            expect(loggerMocks.log).toHaveBeenCalledWith("step 1");
            expect(loggerMocks.log).not.toHaveBeenCalledWith("step 2");
        })
        .finally(assertPromiseResolved(promise, done))
    });

    //TODO: cleanup tasks

    //TODO: modules
    
    
    // describe("for timers", function () {
    //     it("starts and stops a timer", function (done) {
    //         //Arrange
    //         var script = getScript(
    //             "steps: ",
    //             "  - t1 = startTimer",
    //             "  - wait:",
    //             "      milliseconds: 200",
    //             "  - stopTimer: $t1",
    //             "  - log: $t1.milliseconds"
    //         )
    //         spyOn(loggerMocks, "log")
    //         
    //         //Act
    //         var promise = script.run()
    //         
    //         promise.then(function () {
    //             //Assert
    //             expect(loggerMocks.log)
    //                 .toHaveBeenCalledWith(200)
    //         })
    //         .catch(function (err) { console.error(err) })
    //         .finally(assertPromiseResolved(promise, done))
    //     });
    // })
})


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

function getScript() {
    return app.load(Array.prototype.join.call(arguments, '\r\n'))
}