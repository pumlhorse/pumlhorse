/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
import * as _ from 'underscore';
import { AssertModule } from '../../../src/script/modules/assert';


class UnaryAssertTest {
    constructor(
        public command: string, 
        public goodValues: any[], 
        public badValues: any[]) {
    }
}

class AssertTest {
    constructor(
        public command: string,
        public goodValues: any[],
        public badValues: any[]) {}
}

describe('Assert function', () => {

    const unary = [
        new UnaryAssertTest('isTrue', 
            [true, 'true'],
            [false, 'false', 0, 14, {}]),
        new UnaryAssertTest('isFalse',
            [false, 'false'], 
            [true, 'true', 1, 14, {}]),
        new UnaryAssertTest('isNull',
            [null, undefined], 
            [true, 0, 14, {}]),
        new UnaryAssertTest('isNotNull',
            [false, 0, 14, {}], 
            [null, undefined]),
        new UnaryAssertTest('isEmpty',
            [[]], 
            [null, undefined, [1]]),
        new UnaryAssertTest('isNotEmpty',
            [[1]], 
            [null, undefined, []])
    ];

    _.map(unary, (test) => {
        _.map(test.goodValues, val => {
            it(`should accept ${val} for ${test.command}`, () => {
                AssertModule[test.command](val);
            });
        });

        _.map(test.badValues, val => {
            it(`should reject ${val} for ${test.command}`, () => {
                try {
                    AssertModule[test.command](val);
                    fail('Should have thrown an error');
                }
                catch (e) {
                    
                }
            });
        });
    });

    const binary = [
        new AssertTest(
            'areEqual',
            [[4, 4], ['a string value', 'a string value'], [{ val: 15}, { val: 15}]],
            [[4, 5], ['a string value', 'a String value'], [{ val: 15 }, {val: 15, other: 2}]]),
        new AssertTest(
            'areNotEqual',
            [[4, 5], ['a string value', 'a String value'], [{ val: 15 }, {val: 15, other: 2}]],
            [[4, 4], ['a string value', 'a string value'], [{ val: 15}, { val: 15}]]),
        new AssertTest(
            'contains',
            [
                [[4, 5], 4],
                [['first', 'second', 'third'], 'third'],
                [[{val1: 155}, {val1: 156}], {val1: 156}],
                [[{val1: 155, val2: 22}, {val1: 156, val2: 22}], {val1: 156}, true]
            ],
            [
                [[4, 5], 6],
                [['first', 'second', 'third'], 'missing'],
                [[{val1: 155}, {val1: 156}], {val1: 157}]
            ])
    ];

    _.map(binary, (test) => {
        _.map(test.goodValues, vals => {
            const valArray = JSON.stringify(vals);
            it(`should accept ${valArray} for ${test.command}`, () => {
                const cmd = AssertModule[test.command]
                cmd.apply(cmd, vals);
            });
        });

        _.map(test.badValues, vals => {
            const valArray = JSON.stringify(vals);
            it(`should reject ${valArray} for ${test.command}`, () => {
                try {
                    const cmd = AssertModule[test.command]
                    cmd.apply(cmd, vals);
                    fail('Should have thrown an error');
                }
                catch (e) {
                    
                }
            });
        });
    });
    
});
