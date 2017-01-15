/// <reference path="../../../typings/jasmine/jasmine.d.ts" />

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

    var unary = [
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

    unary.map((test) => {
        test.goodValues.map(val => {
            it(`should accept ${val} for ${test.command}`, () => {
                AssertModule[test.command](val);
            });
        });

        test.badValues.map(val => {
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

    var binary = [
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

    binary.map((test) => {
        test.goodValues.map(vals => {
            var valArray = JSON.stringify(vals);
            it(`should accept ${valArray} for ${test.command}`, () => {
                var cmd = AssertModule[test.command]
                cmd.apply(cmd, vals);
            });
        });

        test.badValues.map(vals => {
            var valArray = JSON.stringify(vals);
            it(`should reject ${valArray} for ${test.command}`, () => {
                try {
                    var cmd = AssertModule[test.command]
                    cmd.apply(cmd, vals);
                    fail('Should have thrown an error');
                }
                catch (e) {
                    
                }
            });
        });
    });
    
});
