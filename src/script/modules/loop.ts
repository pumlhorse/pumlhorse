import * as _ from 'underscore';
import { IScope } from '../IScope';
import { pumlhorse } from '../../PumlhorseGlobal';
import enforce from '../../util/enforce';
import * as helpers from '../../util/helpers';


export class LoopModule
{
    static async for(each: string, inVals: any[], steps: any[], $scope: IScope): Promise<any> {
        enforce(each, 'each').isNotNull();
        enforce(inVals, 'in').isNotNull()
            .isArray()
            .isNotEmpty();
        enforce(steps, 'steps')
            .isNotNull()
            .isArray()
            .isNotEmpty();
        
        for (var i = 0; i < inVals.length; i++) {
            var item = inVals[i];
            var newScope = $scope._new()
            helpers.assignObjectByString(newScope, each, item);
            await $scope._runSteps(steps, newScope)
        }
    }

    static async repeat(times: number, steps: any[], $scope: IScope): Promise<any> {
        enforce(times, 'times').isNotNull();
        enforce(steps, 'steps')
            .isNotNull()
            .isArray()
            .isNotEmpty();

        let iterations = 0;
        let newScope = $scope._new();
        while (iterations++ < times) {
            await $scope._runSteps(steps, newScope);
        }
    }

    static async scenarios(cases: any[], steps: any[], base: any, $scope: IScope): Promise<any> {
        enforce(cases, 'cases').isNotNull();
        enforce(steps)
            .isNotNull()
            .isArray()
            .isNotEmpty();
                        
        var caseCount = helpers.getItemCount(cases);
        
        if (!caseCount || caseCount == 0) {
            throw new Error('Scenarios function must contain at least one case');
        }
        
        var keys = _.keys(cases);    
        
        for (var key in cases) {
            var caseVal = cases[key];
            var fullCase = _.extend({}, base, caseVal);
            try {
                await $scope._runSteps(steps, $scope._new(fullCase))
            }
            catch (e) {
                e.message = `Scenario "${key}" failed: ${e.message}`;
                throw e;
            };
        }
    }
}

pumlhorse.module('loop')
    .function('for', ['each', 'in', '$deferred.steps', '$scope', LoopModule.for])
    .function('repeat', ['times', '$deferred.steps', '$scope', LoopModule.repeat])
    .function('scenarios', ['cases', '$deferred.steps', 'base', '$scope', LoopModule.scenarios])