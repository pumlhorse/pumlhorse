import { IScope } from '../IScope';
import enforce from '../../util/enforce';
import * as _ from 'underscore';
import { pumlhorse } from '../PumlhorseGlobal';

export class AsyncModule {
    static runParallel(steps, scope: IScope) {        
        enforce(steps, 'steps')
            .isNotNull()
            .isArray();

        return Promise.all(steps.map(step => {
            var newSteps = _.flatten([step]);
            return scope.$runSteps(newSteps, scope);
        }))
    }
}

pumlhorse.module('async')
    .function('parallel', ['$all', '$scope', AsyncModule.runParallel])