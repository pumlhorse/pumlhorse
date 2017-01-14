import * as _ from 'underscore';
import { IScope } from '../IScope';
import * as Bluebird from 'bluebird';
import { pumlhorse } from '../../PumlhorseGlobal';
import enforce from '../../util/enforce';
import * as helpers from '../../util/helpers';


export class LoopModule
{
    static for(each: string, inVals: any[], steps: any[], $scope: IScope) {
        enforce(each, 'each').isNotNull();
        enforce(inVals, 'in').isNotNull()
            .isArray()
            .isNotEmpty();
        enforce(steps, 'steps')
            .isNotNull()
            .isArray()
            .isNotEmpty();
        
        return Bluebird.each(inVals, function (item) {
            var newScope = $scope.$new()
            helpers.assignObjectByString(newScope, each, item);
            return $scope.$runSteps(steps, newScope)
        })
    }

    static repeat(times: number, steps: any[], $scope: IScope) {
        enforce(times, 'times').isNotNull();
        enforce(steps, 'steps')
            .isNotNull()
            .isArray()
            .isNotEmpty();

        let iterations = 0;

        return LoopModule.promiseWhile(
            () => iterations++ < times,
            () => $scope.$runSteps(steps, $scope.$new()));
    }

    static scenarios(cases: any[], steps: any[], base: any, $scope: IScope) {
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
        
        return Bluebird.each(keys, function (key) {
            var caseVal = cases[key];
            var fullCase = _.extend({}, base, caseVal);
            return $scope.$runSteps(steps, $scope.$new(fullCase))
                .catch(function (e) {
                    e.message = `Scenario "${key}" failed: ${e.message}`;
                    throw e;
                });
        });
    }

    private static promiseWhile = Bluebird.method(function(condition, action) {
        if (!condition()) return;
        return action().then(LoopModule.promiseWhile.bind(null, condition, action));
    });
}

pumlhorse.module('loop')
    .function('for', ['each', 'in', '$deferred.steps', '$scope', LoopModule.for])
    .function('repeat', ['times', '$deferred.steps', '$scope', LoopModule.repeat])
    .function('scenarios', ['cases', '$deferred.steps', 'base', '$scope', LoopModule.scenarios])