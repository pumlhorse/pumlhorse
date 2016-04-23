describe("JSON serialization and deserialization", function () {
    
    var lib
    beforeEach(function () {
        lib = require("../../lib/functions/json")
    });
    
    it("serializes object", function () {
        //Arrange
        
        
        //Act
        var result = lib.toJson({ val: 3})
        
        //Assert
        expect(result).toBe('{"val":3}')        
    });
    
    it("deserializes string", function () {
        //Arrange
        
        
        //Act
        var result = lib.fromJson('{"val":3}')
        
        //Assert
        expect(result.val).toBe(3)        
    });
    
})