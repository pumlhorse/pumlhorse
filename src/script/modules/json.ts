import { pumlhorse } from '../../PumlhorseGlobal';
import enforce from '../../util/enforce';
import * as util from 'util';

export class JsonModule {
    static jsonToObject(val): any {
        enforce(val).isNotNull();
        return JSON.parse(val);
    }

    static objectToJson(val): string {
        enforce(val).isNotNull();
        return util.inspect(val);
    }
}

pumlhorse.module("json")
    .function("fromJson", ["$all", JsonModule.jsonToObject])
    .function("toJson", ["$all", JsonModule.objectToJson]);
  