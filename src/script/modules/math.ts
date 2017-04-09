import enforce from '../../util/enforce';
import * as _ from 'underscore';
import { pumlhorse } from "../../PumlhorseGlobal";

function add($all) {
    enforce($all).isArray().isNotEmpty();
    return _.reduce($all, (memo, num) => memo + num);
}

function subtract($all) {
    enforce($all).isArray().isNotEmpty();
    return _.reduce($all, (memo, num) => memo - num);
}

function multiply($all) {
    enforce($all).isArray().isNotEmpty();
    return _.reduce($all, (memo, num) => memo * num);
}

function divide($all) {
    enforce($all).isArray().isNotEmpty();
    return _.reduce($all, (memo, num) => memo / num);
}

function square(number) {
    enforce(number).isNotNull().isNumber();
    return number * number;
}

pumlhorse.module('math')
    .function('+', add)
    .function('add', add)
    .function('-', subtract)
    .function('subtract', subtract)
    .function('*', multiply)
    .function('multiply', multiply)
    .function('/', divide)
    .function('divide', divide)
    .function('square', ['$all', square])
    ;