import { pumlhorse } from '../PumlhorseGlobal';
import enforce from '../../util/enforce';

export class JsonModule {
    static jsonToObject(val): any {
        enforce(val).isNotNull();
        return JSON.parse(val);
    }

    static objectToJson(val): string {
        enforce(val).isNotNull();
        return JSON.stringify(val);
    }
}

pumlhorse.module("json")
    .function("fromJson", ["$all", JsonModule.jsonToObject])
    .function("toJson", ["$all", JsonModule.objectToJson]);
  