import { Script } from '../../../src/script/Script';

describe('async', () => {
    
    function testAsync(runAsync) {
        return (done) => {
            runAsync().then(done, e => { fail(e); done(); });
        };
    }

    it('scenario', testAsync(async () => {
        // Arrange
        var spy = jasmine.createSpy('log');
        var script = new Script({
            name: 'blah',
            steps: [
                {
                    parallel: [
                        { logMessageInRandomOrder: 'One' },
                        { logMessageInRandomOrder: 'Two' },
                        { logMessageInRandomOrder: 'Three' },
                        { logMessageInRandomOrder: 'Four' }
                    ]
                }
            ]
        });
        script.addFunction('logMessageInRandomOrder', function(message) {
            var scope = this;
            return new Promise((resolve, reject) => { 
                setTimeout(function() { spy(message); resolve(); }, Math.random() * 100) 
            });
        })
        
        // Act
        await script.run();
        
        // Assert
        expect(spy).toHaveBeenCalledWith('One');
        expect(spy).toHaveBeenCalledWith('Two');
        expect(spy).toHaveBeenCalledWith('Three');
        expect(spy).toHaveBeenCalledWith('Four');
        
    }));
    
})