import { IScope } from '../Scope';
import { pumlhorse } from '../../PumlhorseGlobal';
import enforce from '../../util/enforce';
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
        else {
            steps = isFalse;
        }

        return $scope._runSteps(steps, $scope._new());
    }

}

pumlhorse.module("conditional")
    .function("if", ["value", "is true", "is false", "$scope", ConditionalModule.IfStatement]);