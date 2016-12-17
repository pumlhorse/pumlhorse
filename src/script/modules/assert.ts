import { pumlhorse } from '../PumlhorseGlobal';
import * as _ from 'underscore';
import enforce from '../../util/enforce';

export class AssertModule {
    public static isTrue(result): void {
        if (result === true || result === 'true') return;
        throw AssertModule.getExpectedError('isTrue', true, result);
    }
    
    public static isFalse(result): void {
        if (result === false || result === 'false') return;
        throw AssertModule.getExpectedError('isFalse', false, result);
    }
    
    public static isNull(result): void {
        if (result === null || result === undefined) return;
        throw AssertModule.getMessageError('isNull', 'Value is not null');
    }
    
    public static isNotNull(result): void {
        if (result !== null && result !== undefined) return;
        throw AssertModule.getMessageError('isNotNull', 'Value is null');
    }
    
    public static areEqual(expected: any, actual: any, partial: boolean): void {
        if (AssertModule.areEqualInternal(expected, actual, partial)) return;        

        throw AssertModule.getExpectedError('areEqual', expected, actual);
    }
    
    public static areNotEqual(expected: any, actual: any): void {
        if (!AssertModule.areEqualInternal(expected, actual, false)) return;        

        throw AssertModule.getExpectedError('areNotEqual', expected, actual);
    }
    
    public static isEmpty(actual: any[]): void {
        enforce(actual)
            .isNotNull()
            .isArray();    

        if (actual.length != 0) throw AssertModule.getExpectedError('isEmpty', 0, actual.length);
    }
    
    public static isNotEmpty(actual: any): void {
        enforce(actual)
            .isNotNull()
            .isArray();    

        if (actual.length == 0) throw AssertModule.getMessageError('isNotEmpty', 'Array is empty');
    }
    
    public static contains(array: any[], expectedValue: any, partial: boolean): void {
        enforce(array, 'array')
            .isNotNull()
            .isArray();    

        if (array.length == 0) throw AssertModule.getMessageError('contains', 'Array is empty');

        let isFound = false;
        array.forEach(val => {
            if (AssertModule.areEqualInternal(expectedValue, val, partial)) {
                isFound = true;
                return;
            }
        });

        var val = AssertModule.serializeParameter(expectedValue);
        if (!isFound) throw AssertModule.getMessageError('contains', `Array did not contain ${val}`)
    }

    private static getMessageError(command: string, message: string) {
        return new Error(`Assertion '${command}' failed. ${message}`);
    }

    private static getExpectedError(command: string, expected: any, actual: any) {
        const exp = AssertModule.serializeParameter(expected);
        const act = this.serializeParameter(actual);
        return new Error(`Assertion '${command}' failed. Expected '${exp}', actual '${act}'`)
    }

    private static serializeParameter(val: any): string {
        if (_.isObject(val) ||
            _.isArray(val))
        {
            return JSON.stringify(val);
        }

        return val;
    }

    private static areEqualInternal(expected: any, actual: any, partial: boolean) {
        if (partial) {
            if (_.isMatch(actual, expected)) return true;
        }
        else {
            if (_.isEqual(actual, expected)) return true;
        }

        return false;
    }

}

pumlhorse.module('assert')
    .function('isTrue', ['$all', AssertModule.isTrue])
    .function('isFalse', ['$all', AssertModule.isFalse])
    .function('isNull', ['$all', AssertModule.isNull])
    .function('isNotNull', ['$all', AssertModule.isNotNull])
    .function('areEqual', AssertModule.areEqual)
    .function('areNotEqual', AssertModule.areNotEqual)
    .function('isEmpty', ['$all', AssertModule.isEmpty])
    .function('isNotEmpty', ['$all', AssertModule.isNotEmpty])
    .function('contains', ['array', 'value', 'partial', AssertModule.contains]);