import { pumlhorse } from '../PumlhorseGlobal';
import * as _ from 'underscore';

function average(values: number[]): number {
    const sum = _.reduce(values, (total, n: number) => total + n, 0);
    return sum / values.length;
}

function minimum(values: number[]): number {
    return _.min(values);
}

function maximum(values: number[]): number {
    return _.max(values);
}

function median(values: number[]): number {
    let ordered = _.sortBy(values, n => n);
    const middle = values.length / 2;
    if (values.length % 2 == 0) {
        return (ordered[middle] + ordered[middle - 1]) / 2;
    }
    return ordered[Math.floor(middle)];
}

pumlhorse.module('stats')
    .function('average', average)
    .function('minimum', minimum)
    .function('maximum', maximum)
    .function('median', median);