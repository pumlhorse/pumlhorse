class StringParser {
    value: string;
    state: IParseState;
    parts: Part[];

    parse(value: string): Part[] {
        this.value = value;
        this.setState(new LiteralState(this));
        this.parts = [];

        for (let i = 0; i < this.value.length; i++) {
            this.state.read(this.value[i], i);
        }

        if (this.state.value.length > 0) {
            this.push(this.state.value, this.state.type);
        }
        return this.parts;
    }

    push(value: string, type: StringType) {
        this.parts.push(new Part(value, type));
    }

    peek(index: number): string {
        if (index === this.value.length) return null;

        return this.value[index];
    }

    setState(state: IParseState) {
        this.state = state;
    }
}

interface IParseState {
    value: string;
    type: StringType;
    read(character: string, index: number);
}

class LiteralState implements IParseState {
    value: string = '';
    type: StringType = StringType.literal;

    constructor(private parser: StringParser) {}

    read(character: string, index: number) {
        if (character == "$") {
            if (this.value.length > 0) {
                this.parser.push(this.value, StringType.literal);
            }
            if (index + 1 < this.parser.value.length && this.parser.value[index + 1] == "{") {
                this.parser.setState(new ComplexState(this.parser));
            }
            else {
                this.parser.setState(new SimpleState(this.parser));
            }
        }
        else {
            this.value += character
        }
    }
}

const closingSymbols = {
    '{': '}',
    '[': ']',
    '(': ')'
}
const openingSymbols = {
    '}': '{',
    ']': '[',
    ')': '('
}

class SimpleState implements IParseState {
    private static tokenCharacters = /[\w\d\.\_\$]{1}/i;

    value: string = '';
    type: StringType = StringType.tokenized;
    private remainingClosers: string[];

    constructor(private parser: StringParser) {
        this.remainingClosers = [];
    }

    read(character: string, index: number) {
        if (closingSymbols[character] != undefined) {
            this.remainingClosers.push(closingSymbols[character]);
        }
        else if (openingSymbols[character] != undefined) {
            const expected = this.remainingClosers.pop();
            if (expected != character) this.remainingClosers.push(expected);
        } 
        else if (this.remainingClosers.length == 0 && !SimpleState.tokenCharacters.test(character)) {
            this.parser.push(this.value, StringType.tokenized);
            this.parser.setState(new LiteralState(this.parser));
            this.parser.state.read(character, index);
            return;
        }
        else if (character === '.') {
            const nextChar = this.parser.peek(index + 1);
            if (nextChar == null || !SimpleState.tokenCharacters.test(nextChar)) {
                this.parser.push(this.value, StringType.tokenized);
                this.parser.setState(new LiteralState(this.parser));
                this.parser.state.read(character, index);
                return;
            }
        }
        
        this.value += character
    }
}

class ComplexState implements IParseState {
    value: string = '';
    type: StringType = StringType.tokenized;
    private remainingClosers: string[];

    constructor(private parser: StringParser) {
        this.remainingClosers = ['}'];
    }

    read(character: string) {
        if (character == '{' && this.value.length == 0) {
            return; //Expecting an opening curly brace, ignore it
        }
        if (closingSymbols[character] != undefined) {
            this.remainingClosers.push(closingSymbols[character]);
        }
        else if (openingSymbols[character] != undefined) {
            const expected = this.remainingClosers.pop();
            if (expected != character) {
                this.remainingClosers.push(expected);
            }
            else if (this.remainingClosers.length == 0) {
                this.parser.push(this.value, StringType.tokenized);
                this.parser.setState(new LiteralState(this.parser));
                return;
            }
        }
        this.value += character;
    }
}

export enum StringType {
    literal,
    tokenized
}

export class Part {
    isTokenized: boolean;

    constructor(public value: string, type: StringType) {
        this.isTokenized = type == StringType.tokenized;
    }
}


const parser = new StringParser();
export function parse(input: string): Part[] {
    return parser.parse(input);
} 