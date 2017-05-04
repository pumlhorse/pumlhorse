import {ConditionalModule} from '../../../src/script/modules/conditional';

describe('Conditional', () => {
    let $scope;
    beforeEach(() => {
        $scope = jasmine.createSpyObj('scope', ['_runSteps', '_new']);
    });

    describe('when', () => {

        it('handles "== true"', testAsync(async () => {
            // Arrange
            $scope.val = true;
            
            // Act
            await ConditionalModule.when({
                'val == true': [
                    { log: 'is true'}
                ],
                'val == false': [
                    { log: 'is false'}
                ]
            }, $scope);
            
            // Assert
            expect($scope._runSteps).toHaveBeenCalledWith([{ log: 'is true' }], $scope);        
        }));

        it('handles "== false"', testAsync(async () => {
            // Arrange
            $scope.val = false;
            
            // Act
            await ConditionalModule.when({
                'val == true': [
                    { log: 'is true'}
                ],
                'val == false': [
                    { log: 'is false'}
                ]
            }, $scope);
            
            // Assert
            expect($scope._runSteps).toHaveBeenCalledWith([{ log: 'is false' }], $scope);        
        }));

        it('allows other expressions', testAsync(async () => {
            // Arrange
            $scope.val = 3;
            
            // Act
            await ConditionalModule.when({
                'val > 4': [
                    { log: 'bad'}
                ],
                'val < 4': [
                    { log: 'good'}
                ]
            }, $scope);
            
            // Assert
            expect($scope._runSteps).toHaveBeenCalledWith([{ log: 'good' }], $scope);        
        }));

        it('allows multiple expressions', testAsync(async () => {
            // Arrange
            $scope.val = 55;
            
            // Act
            await ConditionalModule.when({
                'val > 3': [
                    'good1'
                ],
                'val > 4': [
                    'good2'
                ]
            }, $scope);
            
            // Assert   
            expect($scope._runSteps).toHaveBeenCalledWith(['good1'], $scope);       
            expect($scope._runSteps).toHaveBeenCalledWith(['good2'], $scope); 
        }));
    });

    function testAsync(runAsync) {
        return (done) => {
            runAsync().then(done, e => { fail(e); done(); });
        };
    }
})