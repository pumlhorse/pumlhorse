/// <reference path="../typings/jasmine/jasmine.d.ts" />
import * as path from 'path';
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

class Test {
    context: any;
    setup: (harness: Harness) => any = () => {};
    constructor(public name: string) {}

    withSetup(setup: (harness: Harness) => any): Test {
        this.setup = setup;
        return this;
    }

    withContext(context: any): Test {
        this.context = context;
        return this;
    }
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

    const selfAssertingScripts = [
        new Test('partialScripts/runPartial1'), 
        new Test('math'), 
        new Test('stats'),
        new Test('prompt/returnsValue')
            .withSetup((harness: Harness) => harness.script.addFunction('prompt', promptForValue))
            .withContext({ existingVal: 'this is an existing value'})
        ];

    selfAssertingScripts.map((test: Test) => {
        it(test.name, testAsync(async () => {
            // Arrange
            const harness = await Harness.create(test.name);
            test.setup(harness);
            
            // Act
            await harness.run(test.context);
            
            // Assert  
        }));
    })

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
    });

    
});

class Harness {

    script: IScript;
    logger: ILogger;
    filePath: string;

    async run(context?: any): Promise<any> {
        if (context == null) context = {};
        context.__filename = this.filePath;
        return await this.script.run(context);
    }

    static async create(filename: string): Promise<Harness> {
        const harness = new Harness();
        const filePath = path.resolve(`integrationTests/${filename}.puml`);

        harness.logger = jasmine.createSpyObj('logger', ['debug', 'log', 'warn', 'error']);
        harness.script = new Script(<IScriptDefinition> await readAsYaml(filePath), {
            logger: harness.logger
        });
        harness.filePath = filePath;
        return harness;
    }
}