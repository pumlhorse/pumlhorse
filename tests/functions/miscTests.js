require("../../lib/script")
var misc = require("../../lib/functions/misc.js")

describe("Miscellaneous functions", function () {
    describe("value", function ()
    {
        it("scenario", function () {
            //Arrange
            var val = {
                prop1: "prop 1 value",
                prop2: true
            }
            
            //Act
            var result = misc.value(val)
            
            //Assert
            expect(result).toBe(val);            
        });
    })
    
})