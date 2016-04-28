describe("Modules", function () {
    
    var _modules;
    var defer;
    beforeEach(function () {
        delete require.cache[require.resolve("../lib/modules")]
        _modules = require("../lib/modules")
    })
    
    describe("Add modules", function () {
        
        it("adds a module", function () {
            //Arrange
            var func = function(blah) {}
            
            //Act
            _modules.addModule("test")
                .function("functionName", func);
            
            //Assert
            expect(_modules.modules["test"].functionName).toBe(func)
        });
        
        it("allows for mapped parameter names", function () {
            //Arrange
            var func = function(p1, p2, test, inVal) {}
            
            //Act
            _modules.addModule("test")
                .function("functionName", ["param1", "param2", "test", "in", func])
            
            //Assert
            expect(_modules.modules["test"].functionName).toBe(func)
            expect(_modules.modules["test"].functionName.__alias).toEqual({
                p1: "param1",
                p2: "param2",
                test: "test",
                inVal: "in"
            })
        });
        
        it("allows for deferred parameters", function () {
            //Arrange
            var func = function(p1, p2, deferMe) {}
            
            //Act
            _modules.addModule("test")
                .function("functionName", ["param1", "param2", "deferMe", func], {
                    deferredParameters: ["deferMe"]
                })
            
            //Assert
            var m = _modules.modules["test"]
            expect(m.functionName).toBe(func)
            expect(m.functionName.__alias).toEqual({
                p1: "param1",
                p2: "param2",
                deferMe: "deferMe"
            })
            expect(m.functionName.__deferEval.length).toBe(1)
            expect(m.functionName.__deferEval[0]).toBe("deferMe")
        });
    })
    
    
})