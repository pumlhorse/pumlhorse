/// <reference path="../typings/jasmine/jasmine.d.ts" />
import { IScriptDefinition } from '../src/script/IScriptDefinition';
import { ILogger } from '../src/script/loggers';
import { IScript } from '../src/script/IScript';
import { Script } from '../src/script/Script';
import {readAsYaml} from '../src/util/asyncFs';
import { promptForValue } from '../src/cli/prompt';

function testAsync(runAsync) {
    return (done) => {
        runAsync().then(done, e => { fail(e); done(); });
    };
}

describe('Integration test - ', () => {

    it('prematurely ends a script', testAsync(async () => {
        // Arrange
        const harness = await Harness.create('earlyEnd');
        
        // Act
        await harness.run();
        
        // Assert
        expect(harness.logger.log).toHaveBeenCalledWith('Beginning')
        expect(harness.logger.log).toHaveBeenCalledTimes(1);        
    }));
    
    it('deliberately fails a script', testAsync(async () => {
        // Arrange
        const harness = await Harness.create('deliberateFail');
        
        try {
            // Act
            await harness.run();
            fail();
        }
        catch (err) {
            // Assert
            expect(harness.logger.log).toHaveBeenCalledWith('Beginning')
            expect(harness.logger.log).toHaveBeenCalledTimes(1);
            expect(err.message).toBe('Fail called');  
        }     
    }));
    
    it('deliberately fails a script', testAsync(async () => {
        // Arrange
        const harness = await Harness.create('deliberateFailWithErrorMessage');
        
        try {
            // Act
            await harness.run();
            fail();
        }
        catch (err) {
            // Assert
            expect(harness.logger.log).toHaveBeenCalledWith('Beginning')
            expect(harness.logger.log).toHaveBeenCalledTimes(1);
            expect(err.message).toBe('My error message');  
        }     
    }));

    describe('prompt', () => {
        
        it('returns the existing value in the context', testAsync(async () => {
            // Arrange
            const harness = await Harness.create('prompt/returnsValue');
            harness.script.addFunction('prompt', promptForValue);
            
            // Act
            await harness.run({ existingVal: 'this is an existing value'});
            
            // Assert
            expect(harness.logger.log).toHaveBeenCalledWith('this is an existing value')
            expect(harness.logger.log).toHaveBeenCalledTimes(1);        
        }));
    })
});

class Harness {

    script: IScript;
    logger: ILogger;

    async run(context?: any): Promise<any> {
        return await this.script.run(context);
    }

    static async create(filename: string): Promise<Harness> {
        let harness = new Harness();

        harness.logger = jasmine.createSpyObj('logger', ['debug', 'log', 'warn', 'error']);
        harness.script = new Script(<IScriptDefinition> await readAsYaml(`integrationTests/${filename}.puml`), {
            logger: harness.logger
        });
        return harness;
    }
}