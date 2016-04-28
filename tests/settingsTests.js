describe("Settings", function () {
    
    var _settings
    beforeEach(function () {
        delete require.cache["../lib/settings"]
        _settings = require("../lib/settings")
    })
    
    describe("Get value", function () {
        
        it("returns undefined if value does not exist", function () {
            //Arrange
                        
            //Act
            var result = _settings.getSetting("setting.doesnot.exist")
            
            //Assert
            expect(result).toBe(undefined)            
        });
        
        it("returns simple value", function () {
            //Arrange
            _settings.addSetting("simple", 12345)
            
            //Act
            var result = _settings.getSetting("simple")
            
            //Assert
            expect(result).toBe(12345)            
        });
        
        it("returns complex value", function () {
            //Arrange
            _settings.addSetting("complex", { val1: "value 1", val2: { complex: true }})
            
            //Act
            var result = _settings.getSetting("complex")
            
            //Assert
            expect(result.val1).toBe("value 1")
            expect(result.val2.complex).toBe(true)            
        });
        
        it("returns nested value value", function () {
            //Arrange
            _settings.addSetting("complex", { val1: "value 1", val2: { complex: true }})
            
            //Act
            var result = _settings.getSetting("complex.val2.complex")
            
            //Assert
            expect(result).toBe(true)            
        });
        
    })
    
})