import { ICancellationToken } from '../../util/CancellationToken';
import * as _ from 'underscore';
import { IScope } from '../Scope';
import { pumlhorse } from '../../PumlhorseGlobal';
import enforce from '../../util/enforce';
import * as helpers from '../../util/helpers';


export class LoopModule
{
    static async for(each: string, inVals: any[], steps: any[], $scope: IScope, $cancellationToken: ICancellationToken): Promise<any> {
        enforce(each, 'each').isNotNull();
        enforce(inVals, 'in').isNotNull()
            .isArray()
            .isNotEmpty();
        enforce(steps, 'steps')
            .isNotNull()
            .isArray()
            .isNotEmpty();
        
        for (let i = 0; i < inVals.length && !$cancellationToken.isCancellationRequested; i++) {
            let item = inVals[i];
            let newScope = $scope._new()
            helpers.assignObjectByString(newScope, each, item);
            await $scope._runSteps(steps, newScope)
        }
    }

    static async repeat(times: number, steps: any[], $scope: IScope, $cancellationToken: ICancellationToken): Promise<any> {
        enforce(times, 'times').isNotNull();
        enforce(steps, 'steps')
            .isNotNull()
            .isArray()
            .isNotEmpty();

        let iterations = 0;
        let newScope = $scope._new();
        while (iterations++ < times && !$cancellationToken.isCancellationRequested) {
            await $scope._runSteps(steps, newScope);
        }
    }

    static async scenarios(cases: any[], steps: any[], base: any, $scope: IScope, $cancellationToken: ICancellationToken): Promise<any> {
        enforce(cases, 'cases').isNotNull();
        enforce(steps)
            .isNotNull()
            .isArray()
            .isNotEmpty();
                        
        const caseCount = helpers.getItemCount(cases);
        
        if (!caseCount || caseCount == 0) {
            throw new Error('Scenarios function must contain at least one case');
        }
                
        for (let key in cases) {
            if ($cancellationToken.isCancellationRequested) return;
            const caseVal = cases[key];
            const fullCase = _.extend({}, base, caseVal);
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
    .function('for', ['each', 'in', '$deferred.steps', '$scope', '$cancellationToken', LoopModule.for])
    .function('repeat', ['times', '$deferred.steps', '$scope', '$cancellationToken', LoopModule.repeat])
    .function('scenarios', ['cases', '$deferred.steps', 'base', '$scope', '$cancellationToken', LoopModule.scenarios])