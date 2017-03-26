import { convertText, getDate } from '../../../src/script/modules/misc';

describe('Misc module', () => {
    it('creates a new date', () => {
        // Arrange
                
        // Act
        var result = getDate('11/12/2013 01:23:45');
        
        // Assert
        expect(result.getMonth()).toBe(10);
        expect(result.getDate()).toBe(12);
        expect(result.getFullYear()).toBe(2013);
        expect(result.getHours()).toBe(1);
        expect(result.getMinutes()).toBe(23);
        expect(result.getSeconds()).toBe(45);
    });

    it('gets the current date', () => {
        // Arrange
        const today = new Date();
        
        // Act
        var result = getDate();
        
        // Assert
        var diff = result.getTime() - today.getTime();
        expect(diff < 3000).toBe(true);
        
    });
    

    it('converts utf-8 text from base64', () => {
        // Arrange
        var val = 'TXkgc3RyaW5nIHZhbHVl';
        
        // Act
        var result = convertText(val, 'base64', 'utf-8');
        
        // Assert
        expect(result).toBe('My string value');
        
    });
    
    it('converts unspecified text from base64', () => {
        // Arrange
        var val = 'TXkgc3RyaW5nIHZhbHVl';
        
        // Act
        var result = convertText(val, 'base64', null);
        
        // Assert
        expect(result).toBe('My string value');
        
    });
    
    it('converts unspecified text to base64', () => {
        // Arrange
        var val = 'My string value';
        
        // Act
        var result = convertText(val, null, 'base64');
        
        // Assert
        expect(result).toBe('TXkgc3RyaW5nIHZhbHVl');
        
    });
    
    it('converts utf-8 text to base64', () => {
        // Arrange
        var val = 'My string value';
        
        // Act
        var result = convertText(val, 'utf-8', 'base64');
        
        // Assert
        expect(result).toBe('TXkgc3RyaW5nIHZhbHVl');
        
    });
    
})