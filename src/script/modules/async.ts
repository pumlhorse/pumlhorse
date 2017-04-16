import { IScope } from '../Scope';
import enforce from '../../util/enforce';
import * as _ from 'underscore';
import { pumlhorse } from '../../PumlhorseGlobal';

function runParallel(steps, $scope: IScope) {        
        enforce(steps, 'steps')
            .isNotNull()
            .isArray();

        return Promise.all(_.map(steps, step => {
            let newSteps = _.flatten([step]);
            return $scope._runSteps(newSteps, $scope);
        }))
    }

pumlhorse.module('async')
    .function('parallel', runParallel)