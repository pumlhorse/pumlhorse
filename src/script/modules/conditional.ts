import * as _ from 'underscore';
import { IScope } from '../Scope';
import { pumlhorse } from '../../PumlhorseGlobal';
import enforce from '../../util/enforce';
import * as Expression from 'angular-expressions';

export class ConditionalModule
{
    static IfStatement(value: any, isTrue: any[], isFalse: any[], $scope: IScope): Promise<any> {
        if (isTrue == null && isFalse == null) {
            throw new Error("If function requires either 'is true' or 'is false'");
        }

        enforce(isTrue, "is true").isArray();
        enforce(isFalse, "is false").isArray();

        let steps: any[];
        if (value && isTrue != null) {
            steps = isTrue;
        }
        else if (isFalse != null) {
            steps = isFalse;
        }

        return steps != null 
            ? $scope._runSteps(steps, $scope._new())
            : Promise.resolve({});
    }

    static async when($all: any, $scope: IScope): Promise<any> {
        enforce($all).isObject()

        for (let expression in $all) {
            const steps = $all[expression];
            if (steps == null || !_.isArray(steps)) {
                throw new Error(`${expression} must have a list of steps`);
            }

            if (Expression.compile(expression)($scope) == true) {
                await $scope._runSteps(steps, $scope);
            }
        }
    }
}

pumlhorse.module("conditional")
    .function("if", ["value", "is true", "is false", "$scope", ConditionalModule.IfStatement])
    .function("when", ConditionalModule.when);