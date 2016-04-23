
global.pumlhorse = {
    module: require("../../lib/modules").addModule   
}
describe("With Assert Parameters", function () {
    var assert = require("../../lib/functions/assert")
    

    function assertException(err, expectedErr) {
        expect(err.command).toBe(expectedErr.command)
        expect(err.expected).toBe(expectedErr.expected)
        expect(err.actual).toBe(expectedErr.actual)
    }

    describe("Asserting 'isTrue'", function () {

        it("throws error when value is false", function () {
            //Arrange

            //Act
            try {
                assert.isTrue(3 == 4);
                fail();
            }
            catch (err) {
                //assert
                assertException(err, { command: "isTrue", expected: true, actual: false });
            }
        });

        it("throws error when value is not truthy", function () {
            //Arrange

            //Act
            try {
                assert.isTrue(3);
                fail();
            }
            catch (err) {
                //assert
                assertException(err, { command: "isTrue", expected: true, actual: 3 });
            }
        });

        it("does nothing when value is true", function () {
            //Arrange

            //Act
            assert.isTrue(true);
        });
    });

    describe("Asserting 'isFalse'", function () {

        it("throws error when value is true", function () {
            //Arrange

            //Act
            try {
                assert.isFalse(true);
                fail();
            }
            catch (err) {
                //assert
                assertException(err, { command: "isFalse", expected: false, actual: true });
            }
        });

        it("throws error when value is not truthy", function () {
            //Arrange

            //Act
            try {
                assert.isFalse(3);
                fail();
            }
            catch (err) {
                //assert
                assertException(err, { command: "isFalse", expected: false, actual: 3 });
            }
        });

        it("does nothing when value is false", function () {
            //Arrange

            //Act
            assert.isFalse(false);

        });
    });

    describe("Asserting 'areEqual'", function () {

        it("throws error when values are not equal", function () {
            //Arrange

            //Act
            try {
                assert.areEqual(41, 42);
                fail();
            }
            catch (err) {
                //assert
                assertException(err, { command: "areEqual", expected: 41, actual: 42 });
            }

        });

        it("does nothing when values are equal", function () {
            //Arrange

            //Act
            assert.areEqual(42, 42);


        });

        it("handles zero values", function () {
            //Arrange

            //Act
            assert.areEqual(0, 0);


        });

        it("handles null values", function () {
            //Arrange

            //Act
            assert.areEqual(null, null);
        });
        
        it("throws error if properties on objects are not the same", function () {
            //Arrange
            var obj1 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 44,
                    anotherVal: true
                }
            }
            var obj2 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 43,
                    anotherVal: true
                }
            }
            
            //Act
            try {
                assert.areEqual(obj1, obj2)
                fail()
            }
            catch (err) {
                assertException(err, { command: "areEqual", expected: JSON.stringify(obj1), actual: JSON.stringify(obj2) });
            }
            
            //Assert
        });
        
        it("throws exception for actual-only properties if flag is not set", function () {
            //Arrange
            var obj1 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 43,
                    anotherVal: true
                },
            }
            var obj2 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 43,
                    anotherVal: true
                },
                extraObj2: "unique to obj2"
            }
            
            //Act
            try {
                assert.areEqual(obj1, obj2)
                fail()
            }
            catch (err) {
                assertException(err, { command: "areEqual", expected: JSON.stringify(obj1), actual: JSON.stringify(obj2) });
            }
            
            //Assert
        });
        
        it("ignores actual-only properties if flag is set", function () {
            //Arrange
            var obj1 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 43,
                    anotherVal: true
                }
            }
            var obj2 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 43,
                    anotherVal: true
                },
                extraObj2: "unique to obj2"
            }
            
            //Act
            assert.areEqual(obj1, obj2, true)
            
            //Assert
        });
        
        it("does nothing if properties on objects are the same", function () {
            //Arrange
            var obj1 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 43,
                    anotherVal: true
                }
            }
            var obj2 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 43,
                    anotherVal: true
                }
            }
            
            //Act
            assert.areEqual(obj1, obj2)
            
            //Assert
        });
        
    });

    describe("Asserting 'areNotEqual'", function () {

        it("throws error when values are equal", function () {
            //Arrange

            //Act
            try {
                assert.areNotEqual(42, 42);
                fail();
            }
            catch (err) {
                //assert
                assertException(err, { command: "areNotEqual", expected: 42, actual: 42 });
            }
        });

        it("does nothing when values are equal", function () {
            //Arrange

            //Act
            assert.areNotEqual(41, 42)
        });
        
        it("throws error if properties on objects are the same", function () {
            //Arrange
            var obj1 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 44,
                    anotherVal: true
                }
            }
            var obj2 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 44,
                    anotherVal: true
                }
            }
            
            //Act
            try {
                assert.areNotEqual(obj1, obj2)
                fail()
            }
            catch (err) {
                assertException(err, { command: "areNotEqual", expected: JSON.stringify(obj1), actual: JSON.stringify(obj2) });
            }
            
            //Assert
        });
        
        it("does nothing if properties on objects are not the same", function () {
            //Arrange
            var obj1 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 43,
                    anotherVal: true
                }
            }
            var obj2 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 44,
                    anotherVal: true
                }
            }
            
            //Act
            assert.areNotEqual(obj1, obj2)
            
            //Assert
        });
    });
    
    describe("isEmpty", function () {
        it("throws an exception if parameter is undefined", function () {
            //Arrange
            
            //Act
            try {
                assert.isEmpty();
                fail();
            }
            catch (err) {
                //assert
                expect(err.message).toBe("No parameter passed to 'isEmpty'");
            }
        });
        
        it("throws an exception if parameter is null", function () {
            //Arrange
            
            //Act
            try {
                assert.isEmpty(null);
                fail();
            }
            catch (err) {
                //assert
                expect(err.message).toBe("No parameter passed to 'isEmpty'");
            }
        });
        
        it("throws an exception if parameter is not an array", function () {
            //Arrange
            
            //Act
            try {
                assert.isEmpty(45);
                fail();
            }
            catch (err) {
                //assert
                expect(err.message).toBe("Parameter passed to 'isEmpty' is not an array");
            }
        });
        
        it("throws an assertion exception if parameter is not empty", function () {
            //Arrange
            
            //Act
            try {
                assert.isEmpty([3, 4]);
                fail();
            }
            catch (err) {
                //assert
                assertException(err, { command: "isEmpty", expected: 0, actual: 2 });
            }
        });
        
        it("does nothing if parameter is empty", function () {
            //Arrange
            
            //Act
            assert.isEmpty([]);
            
            //Assert
        });
        
    })
    
    
    
    describe("isNotEmpty", function () {
        it("throws an exception if parameter is undefined", function () {
            //Arrange
            
            //Act
            try {
                assert.isNotEmpty();
                fail();
            }
            catch (err) {
                //assert
                expect(err.message).toBe("No parameter passed to 'isNotEmpty'");
            }
        });
        
        it("throws an exception if parameter is null", function () {
            //Arrange
            
            //Act
            try {
                assert.isNotEmpty(null);
                fail();
            }
            catch (err) {
                //assert
                expect(err.message).toBe("No parameter passed to 'isNotEmpty'");
            }
        });
        
        it("throws an exception if parameter is not an array", function () {
            //Arrange
            
            //Act
            try {
                assert.isNotEmpty(45);
                fail();
            }
            catch (err) {
                //assert
                expect(err.message).toBe("Parameter passed to 'isNotEmpty' is not an array");
            }
        });
        
        it("throws an assertion exception if parameter is empty", function () {
            //Arrange
            
            //Act
            try {
                assert.isNotEmpty([]);
                fail();
            }
            catch (err) {
                //assert
                assertException(err, { command: "isNotEmpty", expected: "non-empty", actual: 0 });
            }
        });
        
        it("does nothing if parameter is not empty", function () {
            //Arrange
            
            //Act
            assert.isNotEmpty([3, 4]);
            
            //Assert
        });
        
    })
    
    describe("contains", function () {
        it("throws an exception if array is undefined", function () {
            //Arrange
            
            //Act
            try {
                assert.contains();
                fail();
            }
            catch (err) {
                //assert
                expect(err.message).toBe("No array passed to 'contains'");
            }
        });
        
        it("throws an exception if array is null", function () {
            //Arrange
            
            //Act
            try {
                assert.contains(null);
                fail();
            }
            catch (err) {
                //assert
                expect(err.message).toBe("No array passed to 'contains'");
            }
        });
        
        it("throws an exception if array is not an array", function () {
            //Arrange
            
            //Act
            try {
                assert.contains(45);
                fail();
            }
            catch (err) {
                //assert
                expect(err.message).toBe("Parameter passed to 'contains' is not an array");
            }
        });
        
        it("throws an exception if value is not passed", function () {
            //Arrange
            
            //Act
            try {
                assert.contains([3]);
                fail();
            }
            catch (err) {
                //assert
                expect(err.message).toBe("No value passed to 'contains'");
            }
        });
        
        it("throws an assertion exception if value is not in the array", function () {
            //Arrange
            
            //Act
            try {
                assert.contains([3, 4], 5);
                fail();
            }
            catch (err) {
                //assert
                assertException(err, { command: "contains", expected: 5, actual: undefined });
            }
        });
        
        it("does nothing if value is in array", function () {
            //Arrange
            
            //Act
            assert.contains([3, 4, 5], 5);
            
            //Assert
        });
        
        it("throws an assertion exception if object is not in the array", function () {
            //Arrange
            var obj1 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 44,
                    anotherVal: true
                }
            }
            var obj2 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 43,
                    anotherVal: true
                }
            }
            
            //Act
            try {
                assert.contains([{}, obj1], obj2);
                fail();
            }
            catch (err) {
                //assert
                assertException(err, { command: "contains", expected: JSON.stringify(obj2), actual: undefined });
            }
        });
        
        it("does nothing if object is in the array", function () {
            //Arrange
            var obj1 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 44,
                    anotherVal: true
                }
            }
            var obj2 = {
                val1: "val1 value",
                nested: {
                    nestedVal: 44,
                    anotherVal: true
                }
            }
            
            //Act
            assert.contains([{ f: 3}, obj1], obj2);
            
            //Assert
            
        });
        
        it("throws an assertion exception if partially matching object is in the array but flag is not set", function () {
            //Arrange
            var partial = {
                val1: "val1 value",
                nested: {
                    nestedVal: 44,
                    anotherVal: true
                }
            }
            var full = {
                val1: "val1 value",
                nested: {
                    nestedVal: 44,
                    anotherVal: true
                },
                uniqueVal: "only in full object"
            }
            
            //Act
            try {
                assert.contains([{ f: 3}, full], partial);
                fail();
            }
            catch (err) {
                //assert
                assertException(err, { command: "contains", expected: JSON.stringify(partial), actual: undefined });
            }
        });
        
        it("does nothing if partially matching object is in the array and flag is set", function () {
            //Arrange
            var partial = {
                val1: "val1 value",
                nested: {
                    nestedVal: 44,
                    anotherVal: true
                }
            }
            var full = {
                val1: "val1 value",
                nested: {
                    nestedVal: 44,
                    anotherVal: true
                },
                uniqueVal: "only in full object"
            }
            
            //Act
            assert.contains([{ f: 3}, full], partial, true);
            
            //Assert
            
        });
        
    })
});

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

var functions = {};
function addFunction(name, func) {
    functions[name] = func
}

function getScript(steps) {
    var script = new Script({
        steps: steps
    });

    for (var x in functions) {
        script.addFunction(x, functions[x])
    }

    return script
}