import { IScope } from '../../../src/script/IScope';
import * as _ from 'underscore';
import { LoopModule } from '../../../src/script/modules/loop';


describe('Loop module', () => {
    describe('Repeat', () => {
        it('repeats function call for the given number of times', testAsync(async () => {
            // Arrange
            const scope = getScope();
            scope.$runSteps.and.returnValue(Promise.resolve({}));
            scope.$new.and.returnValue(scope);

            var steps = ['repeatTest'];
            
            // Act
            await LoopModule.repeat(4, steps, scope);
            
            // Assert
            expect(scope.$runSteps).toHaveBeenCalledTimes(4);
            expect(scope.$runSteps).toHaveBeenCalledWith(steps, scope);            
        }));
        
    });

    describe('For each', () => {
        it('iterates through all items of a list', testAsync(async () => {
            // Arrange
            const scope = getScope();
            const steps = ['foreach test'];
            
            // Act
            await LoopModule.for('val', ['val 1', 'val 3', 'val 7'], steps, scope);
            
            // Assert
            expect(scope.$runSteps).toHaveBeenCalledTimes(3);
            expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.objectContaining({
                val: 'val 1'
            }));
            expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.objectContaining({
                val: 'val 3'
            }));
            expect(scope.$runSteps).toHaveBeenCalledWith(steps, jasmine.objectContaining({
                val: 'val 7'
            }));
            expect(scope.val).toBeUndefined();
        }));
        
    });

    function testAsync(runAsync) {
        return (done) => {
            runAsync().then(done, e => { fail(e); done(); });
        };
    }

    function getScope(): any {
        const scope = jasmine.createSpyObj('scope', ['$new', '$runSteps']);
        scope.$new.and.callFake((stack) => _.extend({}, scope, stack));
        
        return scope;
    }
});