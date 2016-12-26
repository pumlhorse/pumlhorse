import { pumlhorse } from '../PumlhorseGlobal';
import * as helpers from '../../util/helpers';
import * as _ from 'underscore';

class StatsModule {
    private static DefaultAccessor = n => n;

    static average(values: number[] | any[], field: string): number {
        let accessor = StatsModule.DefaultAccessor
        if (field != null) {
            accessor = n => helpers.objectByString(n, field);
        }
        const sum = _.reduce(values, (total, n: number | any) => total + accessor(n), 0);
        return sum / values.length;
    }

    static minimum(values: number[], field: string): number {
        if (field == null) {
            return _.min(values);
        }

        let accessor = n => helpers.objectByString(n, field);
        return accessor(_.min(values, accessor));
    }

    static maximum(values: number[], field: string): number {
        if (field == null) {
            return _.max(values);
        }

        let accessor = n => helpers.objectByString(n, field);
        return accessor(_.min(values, accessor));
    }

    static median(values: number[], field: string): number {
        let accessor = StatsModule.DefaultAccessor
        if (field != null) {
            accessor = n => helpers.objectByString(n, field);
        }
        let ordered = _.sortBy(values, accessor);
        const middle = values.length / 2;
        if (values.length % 2 == 0) {
            return (accessor(ordered[middle]) + accessor(ordered[middle - 1])) / 2;
        }
        return accessor(ordered[Math.floor(middle)]);
    }
}

pumlhorse.module('stats')
    .function('average', StatsModule.average)
    .function('minimum', StatsModule.minimum)
    .function('maximum', StatsModule.maximum)
    .function('median', StatsModule.median);