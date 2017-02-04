import { IScope } from '../IScope';
import enforce from '../../util/enforce';
import * as _ from 'underscore';
import { pumlhorse } from '../../PumlhorseGlobal';

function runParallel(steps) {        
        enforce(steps, 'steps')
            .isNotNull()
            .isArray();

        var scope = this;
        return Promise.all(steps.map(step => {
            var newSteps = _.flatten([step]);
            return scope._runSteps(newSteps, scope);
        }))
    }

pumlhorse.module('async')
    .function('parallel', runParallel)