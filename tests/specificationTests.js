var app = require("../lib/app.js")
var loggers = require("../lib/loggers.js")

var loggerMocks = {
    log: function () {},
    warn: function () {},
    error: function () {}
}
        
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
		    spyOn(loggerMocks, "log");
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
		    spyOn(loggerMocks, "log");
		    spyOn(loggerMocks, "warn");
		    spyOn(loggerMocks, "error");
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
        
    })
    
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