import { pumlhorse } from '../../PumlhorseGlobal';
import enforce from '../../util/enforce';
import * as circularJson from 'circular-json';

export class JsonModule {
    static jsonToObject(val): any {
        enforce(val).isNotNull();
        return JSON.parse(val);
    }

    static objectToJson(val): string {
        enforce(val).isNotNull();
        return circularJson.stringify(val);
    }
}

pumlhorse.module("json")
    .function("fromJson", ["$all", JsonModule.jsonToObject])
    .function("toJson", ["$all", JsonModule.objectToJson]);
  