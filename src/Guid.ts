import * as uuid from 'uuid';

export class Guid {
    value: string;

    constructor() {
        this.value = uuid.v4();
    }
}