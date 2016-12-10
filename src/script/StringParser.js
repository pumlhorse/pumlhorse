"use strict";
var StringParser = (function () {
    function StringParser() {
    }
    StringParser.prototype.parse = function (value) {
        this.value = value;
        this.setState(new LiteralState(this));
        this.parts = [];
        for (var i = 0; i < this.value.length; i++) {
            this.state.read(this.value[i], i);
        }
        if (this.state.value.length > 0) {
            this.push(this.state.value, this.state.type);
        }
        return this.parts;
    };
    StringParser.prototype.push = function (value, type) {
        this.parts.push(new Part(value, type));
    };
    StringParser.prototype.setState = function (state) {
        this.state = state;
    };
    return StringParser;
}());
var LiteralState = (function () {
    function LiteralState(parser) {
        this.parser = parser;
        this.value = '';
        this.type = StringType.literal;
    }
    LiteralState.prototype.read = function (character, index) {
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
            this.value += character;
        }
    };
    return LiteralState;
}());
var closingSymbols = {
    "{": "}",
    "[": "]",
    "(": ")"
};
var openingSymbols = {
    "}": "{",
    "]": "[",
    ")": "("
};
var SimpleState = (function () {
    function SimpleState(parser) {
        this.parser = parser;
        this.value = '';
        this.type = StringType.tokenized;
        this.remainingClosers = [];
    }
    SimpleState.prototype.read = function (character, index) {
        if (closingSymbols[character] != undefined) {
            this.remainingClosers.push(closingSymbols[character]);
        }
        else if (openingSymbols[character] != undefined) {
            var expected = this.remainingClosers.pop();
            if (expected != character)
                this.remainingClosers.push(expected);
        }
        else if (this.remainingClosers.length == 0 && !SimpleState.tokenCharacters.test(character)) {
            this.parser.push(this.value, StringType.tokenized);
            this.parser.setState(new LiteralState(this.parser));
            this.parser.state.read(character, index);
            return;
        }
        this.value += character;
    };
    return SimpleState;
}());
SimpleState.tokenCharacters = /[\w\d\.\_]/i;
var ComplexState = (function () {
    function ComplexState(parser) {
        this.parser = parser;
        this.value = '';
        this.type = StringType.tokenized;
        this.remainingClosers = ['}'];
    }
    ComplexState.prototype.read = function (character, index) {
        if (character == "{" && this.value.length == 0) {
            return;
        }
        if (closingSymbols[character] != undefined) {
            this.remainingClosers.push(closingSymbols[character]);
        }
        else if (openingSymbols[character] != undefined) {
            var expected = this.remainingClosers.pop();
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
    };
    return ComplexState;
}());
var StringType;
(function (StringType) {
    StringType[StringType["literal"] = 0] = "literal";
    StringType[StringType["tokenized"] = 1] = "tokenized";
})(StringType || (StringType = {}));
var Part = (function () {
    function Part(value, type) {
        this.value = value;
        this.isTokenized = type == StringType.tokenized;
    }
    return Part;
}());
var parser = new StringParser();
function parse(input) {
    return parser.parse(input);
}
exports.parse = parse;
//# sourceMappingURL=StringParser.js.map