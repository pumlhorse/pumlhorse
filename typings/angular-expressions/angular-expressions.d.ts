// Type definitions for angular-expressions v0.3.0

declare namespace angular.expressions {
    interface IExpressionStatic {
        compile(expression: string): any;
    }
}

declare module 'angular-expressions' {
    var _: angular.expressions.IExpressionStatic;
    export = _;
}