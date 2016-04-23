require("../../lib/script")
var _ = require("underscore")
var loop = require("../../lib/functions/loop")

describe("Repeat function", function() {
    it("logs error if no count is specified", function() {
        //Arrange

        //Act
        try {
            loop.repeat()
            fail()
        }
        catch (e) {
        //Assert
            expect(e.message).toBe("Repeat function must contain a 'times' parameter");
        }
    });

        it("logs error if steps is not specified", function() {
            //Arrange

            //Act
        try {
            loop.repeat(4)
            fail()
        }
        catch (e) {
        //Assert
            expect(e.message).toBe("Repeat function must contain a 'steps' parameter");
        }
        });

        it("logs error if steps is empty", function () {
            //Arrange

            //Act
            try {
                loop.repeat(4, [])
                fail()
            }
            catch (e) {
                //Assert
                expect(e.message).toBe("Repeat function must contain at least one step");
            }
        
        });

        it("repeats function call for the given number of times", function(done) {
            //Arrange
            var scope = getScope()
            spyOn(scope, "$runSteps").and.returnValue(Promise.resolve({}))
            var steps = ["repeatTest"]

            //Act
            var promise = loop.repeat.call(scope, 4, steps)
            
            //Assert
            promise.then(function (result) {
                expect(scope.$runSteps).toHaveBeenCalledTimes(4)
                expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.any(Object))
            })
            .finally(assertPromiseResolved(promise, done));
        });
    });
    
    describe("for each function", function () {
        
        it("throws an exception if no 'each' parameter is provided", function () {
            //Arrange
            
            //Act
            try {
                loop.for();
                fail()
            }
            catch (err) {
                //Assert
                expect(err.message).toBe("For function must contain 'each' parameter")            
            }
        });
        
        it("throws an exception if no 'in' parameter is provided", function () {
            //Arrange
            
            //Act
            try {
                loop.for("val");
                fail()
            }
            catch (err) {
                //Assert
                expect(err.message).toBe("For function must contain 'in' parameter")            
            }
        });
        
        it("throws an exception if no steps are provided", function () {
            //Arrange
            
            //Act
            try {
                loop.for("val", "$listValues");
                fail()
            }
            catch (err) {
                //Assert
                expect(err.message).toBe("For function must contain 'steps' parameter")            
            }
        });
        
        it("throws an exception if steps is empty", function () {
            //Arrange
            
            //Act
            try {
                loop.for("val", "$listValues", []);
                fail()
            }
            catch (err) {
                //Assert
                expect(err.message).toBe("For function must contain at least one step")            
            }
        });
        
        it("iterates through all items of a list", function (done) {
            //Arrange
            var scope = getScope()
            spyOn(scope, "$runSteps")
            var steps = ["repeatTest"]
            
            //Act
            var promise = loop.for.call(scope, "val", ["val 1", "val 3", "val 7"], steps)
            
            //Assert
            promise.then(function () {
                expect(scope.$runSteps).toHaveBeenCalledTimes(3)
                expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.objectContaining({
                    val: "val 1"
                }))
                expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.objectContaining({
                    val: "val 3"
                }))
                expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.objectContaining({
                    val: "val 7"
                }))
                expect(scope.val).toBe(undefined)
            })
            .finally(assertPromiseResolved(promise, done));
        });
        
    })
    
    describe("scenarios function", function () {
        
        it("throws an exception if no 'cases' parameter is provided", function () {
            //Arrange
            
            //Act
            try {
                loop.scenarios();
                fail()
            }
            catch (err) {
                //Assert
                expect(err.message).toBe("Scenarios function must contain a 'cases' parameter")            
            }
        });
        
        it("throws an exception if 'cases' parameter is empty", function () {
            //Arrange
            
            //Act
            try {
                loop.scenarios({});
                fail()
            }
            catch (err) {
                //Assert
                expect(err.message).toBe("Scenarios function must contain at least one case")            
            }
        });
        
        it("throws an exception if no steps are provided", function () {
            //Arrange
            
            //Act
            try {
                loop.scenarios({ case1: {}});
                fail()
            }
            catch (err) {
                //Assert
                expect(err.message).toBe("Scenarios function must contain a 'steps' parameter")            
            }
        });
        
        it("throws an exception if steps is empty", function () {
            //Arrange
            
            //Act
            try {
                loop.scenarios({ case1: {}}, []);
                fail()
            }
            catch (err) {
                //Assert
                expect(err.message).toBe("Scenarios function must contain at least one step")            
            }
        });
        
        it("iterates through all items of a list", function (done) {
            //Arrange
            var scope = getScope()
            var steps = ["scenarioTest"]
            var cases = {
                case1: { val1: "1", val2: "2"},
                case2: { val1: "3", val2: "4"},
            }
            spyOn(scope, "$runSteps").and.returnValue(Promise.resolve({}))
            
            //Act
            var promise = loop.scenarios.call(scope, cases, steps);
            
            //Assert
            promise.then(function () {
                expect(scope.$runSteps).toHaveBeenCalledTimes(2)
                expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.objectContaining({
                    val1: "1",
                    val2: "2"
                }))
                expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.objectContaining({
                    val1: "3",
                    val2: "4"
                }))
            })
            .finally(assertPromiseResolved(promise, done));
        });
        
        it("supports base scenario data", function (done) {
            //Arrange
            var scope = getScope()
            var steps = ["scenarioTest"]
            var cases = {
                case1: { val1: "1", val2: "2"},
                case2: { val1: "3", val2: "4"},
            }
            var baseData = {
                baseVal: "base value"
            }
            spyOn(scope, "$runSteps").and.returnValue(Promise.resolve({}))
            
            //Act
            var promise = loop.scenarios.call(scope, cases, steps, baseData);
            
            //Assert
            promise.then(function () {
                expect(scope.$runSteps).toHaveBeenCalledTimes(2)
                expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.objectContaining({
                    val1: "1",
                    val2: "2",
                    baseVal: "base value"
                }))
                expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.objectContaining({
                    val1: "3",
                    val2: "4",
                    baseVal: "base value"
                }))
            })
            .finally(assertPromiseResolved(promise, done));
        });
        
        it("uses a fresh scope for each loop", function (done) {
            //Arrange
            var scope = getScope()
            var scopeSpy = jasmine.createSpy("scope");
            var runStepsMock = function (steps) {
                scopeSpy(_.extend({}, this))
                return Promise.resolve({});
            }
            spyOn(scope, "$runSteps").and.callFake(runStepsMock)
            var steps = ["scenarioTest"]
            var cases = {
                case1: { val1: "1", val2: "2"},
                case2: { val3: "3" },
            }
            
            //Act
            var promise = loop.scenarios.call(scope, cases, steps);
            
            //Assert
            promise.then(function () {
                expect(scope.$runSteps).toHaveBeenCalledTimes(2)
                expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.objectContaining({
                    val1: "1",
                    val2: "2"
                }))
                expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.objectContaining({
                    val3: "3",
                }))
                expect(scope.$runSteps).not.toHaveBeenCalledWith(steps, jasmine.objectContaining({
                    val3: "3",
                    val1: "1",
                    val2: "2"
                }))
                expect(scope.val1).toBe(undefined)
                expect(scope.val2).toBe(undefined)
                expect(scope.val3).toBe(undefined)
            })
            .finally(assertPromiseResolved(promise, done));
        });
        
        it("logs scenario name on error", function (done) {
            //Arrange
            var scope = getScope()
            spyOn(scope, "$runSteps").and.returnValue(Promise.reject(new Error("an error")))
            var steps = ["scenarioTest"]
            var cases = {
                case1: { val1: "1", val2: "2"},
                case2: { val3: "3" },
            }
            
            //Act
            var promise = loop.scenarios.call(scope, cases, steps);
            
            //Assert
            promise.catch(function (e) {
                expect(e.message).toBe("Scenario 'case1' failed: an error")
            })
            .finally(assertPromiseRejected(promise, done));
        });
        
        
    })
    
function getScope() {
    var scope = {
        $runSteps: function () {},
        $new: function (stack) {
            return _.extend({}, scope, stack);
        }
    }
    
    return scope;
}

function assertPromiseResolved(promise, doneFunc) {
    return function () {
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