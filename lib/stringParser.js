module.exports = {
    parse: parse
}


var parser = new Parser()
function parse(str) {
    return parser.parse(str)
}

function Parser() {
    this.value = null
    this.state = null;
    this.parts = null
}

Parser.prototype.parse = function(value) {
    this.value = value
    this.setState(LiteralState)
    this.parts = []
    for (var i = 0; i < this.value.length; i++) {
        this.state.read(this.value[i], i)
    }
    if (this.state.value.length > 0) this.push(this.state.value, this.state.type)
    return this.parts
}

Parser.prototype.push = function(value, type) {
    this.parts.push(new Part(value, type))
}

Parser.prototype.setState = function(stateType) {
    this.state = new stateType(this)
}

var StringTypes = {
    Literal: 1,
    Tokenized: 2
}

function LiteralState(parser) {
    this.value = ""
    this.parser = parser
}
LiteralState.prototype.type = StringTypes.Literal
LiteralState.prototype.read = function (char, i) {
    if (char == "$") {
        if (this.value.length > 0) {
            this.parser.push(this.value, StringTypes.Literal)
        }
        if (i + 1 < this.parser.value.length && this.parser.value[i + 1] == "{") {
            this.parser.setState(ComplexState)
        }
        else {
            this.parser.setState(SimpleState)
        }
        return;
    }
    this.value += char
}

function SimpleState(parser) {
    this.value = ""
    this.parser = parser
    this.remainingClosers = []
}
SimpleState.prototype.type = StringTypes.Tokenized
SimpleState.prototype.TokenCharacters = /[\w\d\.\_]/i
SimpleState.prototype.read = function(char, i) {
    if (closingSymbols[char] != undefined) this.remainingClosers.push(closingSymbols[char])
    else if (openingSymbols[char] != undefined) {
        var expected = this.remainingClosers.pop()
        if (expected != char) this.remainingClosers.push(expected)
    } 
    else if (this.remainingClosers.length == 0 && !this.TokenCharacters.test(char)) {
        this.parser.push(this.value, StringTypes.Tokenized)
        this.parser.setState(LiteralState)
        this.parser.state.read(char, i)
        return
    }
    
    this.value += char
}

function ComplexState(parser) {
    this.value = ""
    this.parser = parser
    this.remainingClosers = ["}"]
}
ComplexState.prototype.type = StringTypes.Tokenized
ComplexState.prototype.read = function(char, i) {
    if (char == "{" && this.value.length == 0) return; //Expecting an opening curly brace, ignore it
    if (closingSymbols[char] != undefined) this.remainingClosers.push(closingSymbols[char])
    else if (openingSymbols[char] != undefined) {
        var expected = this.remainingClosers.pop();
        if (expected != char) this.remainingClosers.push(expected)
        else if (this.remainingClosers.length == 0) {
            this.parser.push(this.value, StringTypes.Tokenized)
            this.parser.setState(LiteralState)
            return
        }
    }
    this.value += char 
}

function Part(value, type) {
    this.value = value
    this.isTokenized = type != StringTypes.Literal
}

var closingSymbols = {
    "{": "}",
    "[": "]",
    "(": ")"
}
var openingSymbols = {
    "}": "{",
    "]": "[",
    ")": "("
}