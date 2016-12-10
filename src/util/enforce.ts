import * as _ from 'underscore';

export default function(value: any, parameterName?: string): Enforcement {
    return new Enforcement(value, parameterName);
}

class Enforcement {
    value: any;
    parameterName: string;

    constructor(value: any, parameterName?: string) {
        this.value = value;
        this.parameterName = parameterName;
    }

    isNotNull(): Enforcement {
        if (this.value === undefined) this.throwError('is required');
        if (this.value == null) this.throwError('cannot be null');
        return this;
    }

    isArray(): Enforcement {
        if (!_.isArray(this.value)) this.throwError('must be an array');
        return this;
    }

    isNotEmptyArray(): Enforcement {
        if (this.value.length == 0) this.throwError('cannot be empty');
        return this;
    }

    isString(): Enforcement {
        if (!_.isString(this.value)) this.throwError('must be a string');
        return this;
    }

    isFunction(overrideMessage?: string): Enforcement {
        if (!_.isFunction(this.value)) this.throwError('must be a function', overrideMessage);
        return this;
    }

    private throwError(message: string, overrideMessage?: string) {
        if (overrideMessage != null) throw new Error(overrideMessage);
        
        var prefix = this.parameterName == null
            ? 'Parameter '
            : `Parameter '${this.parameterName}'`;
        throw new Error(prefix + message)
    }
}