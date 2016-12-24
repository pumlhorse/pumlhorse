import { Step } from '../../src/script/Step';
describe('Step', () => {

    function testAsync(runAsync) {
        return (done) => {
            runAsync().then(done, e => { fail(e); done(); });
        };
    }

    describe('with no parameters', () => {

        let scope: any;
        let mock;
        beforeEach(() => {
            mock = jasmine.createSpy('spy');
            scope = {
                testFunc: function() {
                    mock.apply(mock, arguments);
                }
            }
        });

        it('should handle a value type', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', 'a value type', scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith('a value type');
        }));

        it('should handle an object', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', { objVal: { inner: 33 } }, scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith({ objVal: { inner: 33 } });
        }));

        it('should handle an array', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', [44, 55, 198], scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith([44, 55, 198]);
        }));
    });

    describe('with a single parameter', () => {

        let scope: any;
        let mock;
        beforeEach(() => {
            mock = jasmine.createSpy('spy');
            scope = {
                testFunc: function(val) {
                    mock(val);
                }
            }
        });

        it('should handle a value type', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', 'a value type', scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith('a value type');
        }));

        it('should handle a variable', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', '$myVal', scope);
            scope.myVal = 66;
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith(66);
        }));

        it('should handle a variable array', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', '$myVal', scope);
            scope.myVal = [66, 77, 88];
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith([66, 77, 88]);
        }));

        it('should handle an object', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', { objVal: { inner: 33 }, val: 55 }, scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith(55);
        }));

        it('should handle an array', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', [44, 55, 198], scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith([44, 55, 198]);
        }));
    });

    describe('with multiple parameters', () => {

        let scope: any;
        let mock;
        beforeEach(() => {
            mock = jasmine.createSpy('spy');
            scope = {
                testFunc: function(val1, val2) {
                    mock(val1, val2);
                }
            }
        });

        it('should handle a value type', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', 'a value type', scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith('a value type', undefined);
        }));

        it('should handle an object', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', { val1: 33, val2: 44, val3: 99 }, scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith(33, 44);
        }));

        it('should handle an array', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', [44, 55, 198], scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith([44, 55, 198], undefined);
        }));
    });

    describe('with $scope and $all', () => {

        let scope: any;
        let mock;
        beforeEach(() => {
            mock = jasmine.createSpy('spy');
            scope = {
                testFunc: function($scope, $all) {
                    mock($scope, $all);
                }
            };
        });

        it('should handle empty parameters', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', null, scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith(scope, null);
        }));
        

        it('should handle a value type', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', 'a value type', scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith(scope, 'a value type');
        }));

        it('should handle an object', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', { val1: 33, val2: 44, val3: 99 }, scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith(scope, { val1: 33, val2: 44, val3: 99 });
        }));

        it('should handle an array', testAsync(async () => {
            // Arrange
            var step = new Step('testFunc', [44, 55, 198], scope);
            
            // Act
            await step.run();
            
            // Assert
            expect(mock).toHaveBeenCalledWith(scope, [44, 55, 198]);
        }));
    });
});