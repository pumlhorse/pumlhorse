
import { JsonModule } from '../../../src/script/modules/json';


describe('Json module', () => {
    it('serializes and deserializes correctly', () => {
        // Arrange
        var obj = {
            val: 44,
            inner: {
                nested: {
                    val: 'a string value'
                }
            }
        };
        
        // Act
        var result = JsonModule.jsonToObject(JsonModule.objectToJson(obj));
        
        // Assert
        expect(result.val).toBe(44);
        expect(result.inner.nested.val).toBe('a string value')
    });
    
    it('serializes recursive values', () => {
        // Arrange
        var obj = {inner: null};
        var inner = {
            circular: obj
        };
        obj.inner = inner;
        
        // Act
        JsonModule.objectToJson(obj);
        
        // Assert
        //Verify no exception was thrown
    });
});