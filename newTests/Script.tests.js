"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var Script_1 = require("../src/Script");
var loggers_1 = require("../src/loggers");
describe('Script', function () {
    var loggerMocks;
    var mock;
    beforeEach(function () {
        mock = jasmine.createSpy('mock');
        loggerMocks = jasmine.createSpyObj('loggers', ['log', 'warn', 'error']);
        loggers_1.setLoggers(loggerMocks);
    });
    function testAsync(runAsync) {
        return function (done) {
            runAsync().then(done, function (e) { fail(e); done(); });
        };
    }
    it('should display a warning when there are no steps', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
        var script;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    script = getScript([]);
                    return [4 /*yield*/, script.run()];
                case 1:
                    _a.sent();
                    expect(loggerMocks.warn).toHaveBeenCalledWith('Script does not contain any steps');
                    return [2 /*return*/];
            }
        });
    }); }));
    it('does not display a warning when there is at least one test step', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
        var script;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    script = getScript(['noop']);
                    return [4 /*yield*/, script.run()];
                case 1:
                    _a.sent();
                    expect(loggerMocks.warn).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); }));
    it('runs raw javascript if step is a string and not a function name', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
        var script, noop;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    script = getScript(['${noop("new value")}']);
                    noop = jasmine.createSpy('noop');
                    script.addFunction('noop', noop);
                    return [4 /*yield*/, script.run()];
                case 1:
                    _a.sent();
                    expect(noop).toHaveBeenCalledWith('new value');
                    return [2 /*return*/];
            }
        });
    }); }));
    it('does not run a function with parameters if it doesnt exist', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
        var script, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    script = getScript([{
                            doesNotExistFunc: {
                                var1: "x"
                            }
                        }]);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, script.run()];
                case 2:
                    _a.sent();
                    fail();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    expect(err_1.message).toBe('Function "doesNotExistFunc" does not exist');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }));
    describe('with parameters', function () {
        it('passes parameters to function', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            function testWithParameters(var1, var2, var3) { mock(var1, var2, var3); }
            var testObj, script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        testObj = { f: 3 };
                        script = getScript([
                            {
                                'testWithParameters': {
                                    var1: 'var1',
                                    var3: testObj,
                                    var2: 2
                                }
                            }
                        ]);
                        script.addFunction('testWithParameters', testWithParameters);
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith('var1', 2, testObj);
                        return [2 /*return*/];
                }
            });
        }); }));
        it('accepts complex parameters', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            function testComplex(var1) { mock(var1); }
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            {
                                'testComplex': {
                                    var1: {
                                        innerVal: "${2 + 2}"
                                    }
                                }
                            }
                        ]);
                        script.addFunction('testComplex', testComplex);
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith({ innerVal: 4 });
                        return [2 /*return*/];
                }
            });
        }); }));
        it('passes undefined for missing parameters', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            function testMissing(var1) { mock(var1); }
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            {
                                'testMissing': {
                                    var3: 'ignored'
                                }
                            }
                        ]);
                        script.addFunction('testMissing', testMissing);
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith(undefined);
                        return [2 /*return*/];
                }
            });
        }); }));
        it('accepts variables in parameters', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            function testParameterWithVariable(var1) { mock(var1); }
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            {
                                'testParameterWithVariable': {
                                    var1: '${3 * 7}'
                                }
                            }
                        ]);
                        script.addFunction('testParameterWithVariable', testParameterWithVariable);
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith(21);
                        return [2 /*return*/];
                }
            });
        }); }));
        it('handles complex object variables in parameters', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var complexObj, script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        complexObj = { nested: { val: 144 } };
                        script = getScript([
                            'complexObj = returnComplexObj',
                            {
                                'testComplexParameter': {
                                    var1: '$complexObj.nested.val'
                                }
                            }
                        ]);
                        script.addFunction('testComplexParameter', function (var1) { mock(var1); });
                        script.addFunction('returnComplexObj', function () { return complexObj; });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith(144);
                        return [2 /*return*/];
                }
            });
        }); }));
        it('allows variables inside string literals', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            'url = http://example.org',
                            {
                                'testStringLiteral': 'String literal with $url/somePath here'
                            }
                        ]);
                        script.addFunction('testStringLiteral', function (var1) { mock(var1); });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith('String literal with http://example.org/somePath here');
                        return [2 /*return*/];
                }
            });
        }); }));
        it('persists complex type information in variables', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var dt, script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dt = new Date();
                        script = getScript([
                            'date = returnDate',
                            {
                                testObj: '$date'
                            }
                        ]);
                        script.addFunction('returnDate', function () { return dt; });
                        script.addFunction('testObj', function (var1) { mock(var1); });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith(dt);
                        return [2 /*return*/];
                }
            });
        }); }));
        it('handles assignment for values that are promises', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var deferred, script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deferred = Promise.resolve('promise value');
                        script = getScript([
                            'p = returnPromise',
                            {
                                testObj: '$p'
                            }
                        ]);
                        script.addFunction('returnPromise', function () { return deferred; });
                        script.addFunction('testObj', function (var1) { mock(var1); });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith('promise value');
                        return [2 /*return*/];
                }
            });
        }); }));
        it('passes simple arguments items for anonymous parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var func, script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        func = function (val) {
                            mock(val);
                        };
                        func['__alias'] = ['@'];
                        script = getScript([
                            {
                                testWithAnonymousParameter: 456
                            }
                        ]);
                        script.addFunction('testWithAnonymousParameter', func);
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith(456);
                        return [2 /*return*/];
                }
            });
        }); }));
        it('passes complex arguments items for anonymous parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var func, script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        func = function (val) {
                            mock(val);
                        };
                        func['__alias'] = ['@'];
                        func['__passAsObject'] = true;
                        script = getScript([
                            {
                                testWithAnonymousParameter: {
                                    testVal: 456,
                                    complex: { val: "here" }
                                }
                            }
                        ]);
                        script.addFunction('testWithAnonymousParameter', func);
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith({
                            testVal: 456,
                            complex: { val: "here" }
                        });
                        return [2 /*return*/];
                }
            });
        }); }));
    });
    describe('Assignment', function () {
        it('assigns value if value is not a function', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            'val1 = some-test-string',
                            {
                                noop: {
                                    value: '$val1'
                                }
                            }
                        ]);
                        script.addFunction('noop', function (value) { return mock(value); });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith('some-test-string');
                        return [2 /*return*/];
                }
            });
        }); }));
        it('assigns value containing equal sign', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            'val1 = db=something;connection=false',
                            {
                                noop: {
                                    value: '$val1'
                                }
                            }
                        ]);
                        script.addFunction('noop', function (value) { return mock(value); });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith('db=something;connection=false');
                        return [2 /*return*/];
                }
            });
        }); }));
        it('assigns null function result to variable', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            'val1 = returnNull',
                            {
                                noop: {
                                    value: '$val1'
                                }
                            }
                        ]);
                        script.addFunction('returnNull', function (value) { return null; });
                        script.addFunction('noop', function (value) { return mock(value); });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith(null);
                        return [2 /*return*/];
                }
            });
        }); }));
    });
    describe('with context', function () {
        it('allows a null context', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            'noop'
                        ]);
                        script.addFunction('noop', function (value) { return mock(value); });
                        return [4 /*yield*/, script.run(null)];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); }));
        it('allows a context passed in', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            {
                                doThing: {
                                    someVal: '$val1',
                                    someOtherVal: '$val2'
                                }
                            }
                        ]);
                        script.addFunction('doThing', function (someVal, someOtherVal) { return mock(someVal, someOtherVal); });
                        return [4 /*yield*/, script.run({
                                val2: 'second value',
                                val1: 'first value'
                            })];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith('first value', 'second value');
                        return [2 /*return*/];
                }
            });
        }); }));
        it('allows a complex context', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            {
                                doThing: {
                                    someVal: '$val1.nested.val',
                                }
                            }
                        ]);
                        script.addFunction('doThing', function (someVal) { return mock(someVal); });
                        return [4 /*yield*/, script.run({
                                val1: {
                                    nested: {
                                        val: 'abcd'
                                    }
                                }
                            })];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith('abcd');
                        return [2 /*return*/];
                }
            });
        }); }));
    });
    describe('with modules', function () {
        it('throws an error if module doesnt exist', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                try {
                    script = new Script_1.Script({
                        name: 'test script',
                        modules: ['badModule'],
                        steps: ['noop']
                    });
                    fail();
                }
                catch (err) {
                    expect(err.message).toBe('Module "badModule" does not exist');
                    expect(mock).not.toHaveBeenCalled();
                }
                return [2 /*return*/];
            });
        }); }));
        it('uses a valid module', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Script_1.pumlhorse.module('goodModule')
                            .function('sayHello', function () { return mock(); });
                        script = new Script_1.Script({
                            name: 'test script',
                            modules: ['goodModule'],
                            steps: ['sayHello']
                        });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); }));
        it('allows namespaces for modules', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Script_1.pumlhorse.module('goodModule')
                            .function('sayHello', function () { return mock(); });
                        script = new Script_1.Script({
                            name: 'test script',
                            modules: ['myModule = goodModule'],
                            steps: ['myModule.sayHello']
                        });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); }));
        it('provides the correct scope to namespaced modules', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Script_1.pumlhorse.module('goodModule')
                            .function('sayHello', function () { mock(this); });
                        script = new Script_1.Script({
                            name: 'test script',
                            modules: ['myModule = goodModule'],
                            steps: ['myModule.sayHello']
                        });
                        return [4 /*yield*/, script.run({ someVal: 321 })];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith(jasmine.objectContaining({
                            $emit: jasmine.any(Function),
                            someVal: 321
                        }));
                        return [2 /*return*/];
                }
            });
        }); }));
        it('provides the correct scope to namespaced modules with parameters', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Script_1.pumlhorse.module('goodModule')
                            .function('sayHello', function (param1, param2) { mock(this, param1, param2); });
                        script = new Script_1.Script({
                            name: 'test script',
                            modules: ['myModule = goodModule'],
                            steps: [{ 'myModule.sayHello': { param1: 11, param2: 22 } }]
                        });
                        return [4 /*yield*/, script.run({ someVal: 321 })];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith(jasmine.objectContaining({
                            $emit: jasmine.any(Function),
                            someVal: 321
                        }), 11, 22);
                        return [2 /*return*/];
                }
            });
        }); }));
        it('allows a module to access another module through $module', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Script_1.pumlhorse.module('goodModule')
                            .function('sayHello', function () { mock(); });
                        Script_1.pumlhorse.module('otherModule')
                            .function('callOtherModule', function () {
                            var scope = this;
                            scope.$module('goodModule').sayHello();
                        });
                        script = new Script_1.Script({
                            name: 'test script',
                            modules: ['myModule = goodModule', 'otherModule'],
                            steps: ['callOtherModule']
                        });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); }));
    });
    describe('with cleanup tasks', function () {
        it('runs a cleanup task at the end of a script', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = new Script_1.Script({
                            name: 'test script',
                            steps: [
                                { log: 'step 1' },
                                { log: 'step 2' },
                            ],
                            cleanup: [
                                { log: 'cleanup step' }
                            ]
                        });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(loggerMocks.log).toHaveBeenCalledWith('step 1');
                        expect(loggerMocks.log).toHaveBeenCalledWith('step 2');
                        expect(loggerMocks.log).toHaveBeenCalledWith('cleanup step');
                        return [2 /*return*/];
                }
            });
        }); }));
        it('runs a cleanup task even if a step failed', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = new Script_1.Script({
                            name: 'test script',
                            steps: [
                                { log: 'step 1' },
                                'throwException',
                                { log: 'step 2' },
                            ],
                            cleanup: [
                                { log: 'cleanup step' }
                            ]
                        });
                        script.addFunction('throwException', function () {
                            throw new Error('Oops!');
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, script.run()];
                    case 2:
                        _a.sent();
                        fail();
                        return [3 /*break*/, 4];
                    case 3:
                        ex_1 = _a.sent();
                        expect(ex_1.message).toBe('Oops!');
                        expect(loggerMocks.log).toHaveBeenCalledWith('step 1');
                        expect(loggerMocks.log).not.toHaveBeenCalledWith('step 2');
                        expect(loggerMocks.log).toHaveBeenCalledWith('cleanup step');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }));
        it('runs a cleanup task even if one failed', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script, ex_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = new Script_1.Script({
                            name: 'test script',
                            steps: [
                                { log: 'step 1' },
                                'throwException',
                                { log: 'step 2' },
                            ],
                            cleanup: [
                                { log: 'cleanup step1' },
                                'throwException',
                                { log: 'cleanup step2' }
                            ]
                        });
                        script.addFunction('throwException', function () {
                            throw new Error('Oops!');
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, script.run()];
                    case 2:
                        _a.sent();
                        fail();
                        return [3 /*break*/, 4];
                    case 3:
                        ex_2 = _a.sent();
                        expect(ex_2.message).toBe('Oops!');
                        expect(loggerMocks.log).toHaveBeenCalledWith('step 1');
                        expect(loggerMocks.log).not.toHaveBeenCalledWith('step 2');
                        expect(loggerMocks.log).toHaveBeenCalledWith('cleanup step1');
                        expect(loggerMocks.log).toHaveBeenCalledWith('cleanup step2');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }));
        it('exposes a method in the scope to add a cleanup task', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            'methodWithCleanup'
                        ]);
                        script.addFunction('methodWithCleanup', function () {
                            var scope = this;
                            scope.$cleanup(function () { return mock('this is in cleanup'); });
                        });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith('this is in cleanup');
                        return [2 /*return*/];
                }
            });
        }); }));
        it('runs cleanup tasks in reverse order', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script, arr, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            'methodWithCleanup',
                            'methodWithCleanup',
                            'methodWithCleanup'
                        ]);
                        arr = [];
                        i = 0;
                        script.addFunction('methodWithCleanup', function () {
                            var scope = this;
                            var num = i++;
                            scope.$cleanup(function () { return arr.push(num); });
                        });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(arr[0]).toBe(2);
                        expect(arr[1]).toBe(1);
                        expect(arr[2]).toBe(0);
                        return [2 /*return*/];
                }
            });
        }); }));
        it('allows cleanup tasks to be prepended', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script, arr, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            'methodWithCleanup',
                            'methodWithCleanup',
                            'methodWithCleanup'
                        ]);
                        arr = [];
                        i = 0;
                        script.addFunction('methodWithCleanup', function () {
                            var scope = this;
                            var num = i++;
                            scope.$cleanupAfter(function () { return arr.push(num); });
                        });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(arr[0]).toBe(0);
                        expect(arr[1]).toBe(1);
                        expect(arr[2]).toBe(2);
                        return [2 /*return*/];
                }
            });
        }); }));
    });
    describe('with steps', function () {
        describe('with no declared parameters', function () {
            it('handles zero parameters', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
                var script;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            script = getScript([
                                'noParam'
                            ]);
                            script.addFunction('noParam', mock);
                            return [4 /*yield*/, script.run()];
                        case 1:
                            _a.sent();
                            expect(mock).toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); }));
            it('handles a string parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
                var script;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            script = getScript([
                                { noParam: 'a value' }
                            ]);
                            script.addFunction('noParam', mock);
                            return [4 /*yield*/, script.run()];
                        case 1:
                            _a.sent();
                            expect(mock).toHaveBeenCalledWith('a value');
                            return [2 /*return*/];
                    }
                });
            }); }));
            it('handles an array parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
                var script;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            script = getScript([
                                { noParam: ['val1', 'val2'] }
                            ]);
                            script.addFunction('noParam', mock);
                            return [4 /*yield*/, script.run()];
                        case 1:
                            _a.sent();
                            expect(mock).toHaveBeenCalledWith('val1', 'val2');
                            return [2 /*return*/];
                    }
                });
            }); }));
            it('handles a variable parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
                var script;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            script = getScript([
                                { noParam: '$myVal' }
                            ]);
                            script.addFunction('noParam', mock);
                            return [4 /*yield*/, script.run({ myVal: 12345 })];
                        case 1:
                            _a.sent();
                            expect(mock).toHaveBeenCalledWith(12345);
                            return [2 /*return*/];
                    }
                });
            }); }));
            it('handles a variable (array) parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
                var script;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            script = getScript([
                                { noParam: '$myVal' }
                            ]);
                            script.addFunction('noParam', mock);
                            return [4 /*yield*/, script.run({ myVal: [12345, 67890] })];
                        case 1:
                            _a.sent();
                            expect(mock).toHaveBeenCalledWith([12345, 67890]);
                            return [2 /*return*/];
                    }
                });
            }); }));
            it('handles a function with an unnamed inline javascript parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
                var script;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            script = getScript([
                                { noParam: '${2 * 3}' }
                            ]);
                            script.addFunction('noParam', mock);
                            return [4 /*yield*/, script.run()];
                        case 1:
                            _a.sent();
                            expect(mock).toHaveBeenCalledWith(6);
                            return [2 /*return*/];
                    }
                });
            }); }));
            it('handles a function with an unnamed inline javascript (array) parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
                var script;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            script = getScript([
                                { noParam: '${[3, 4]}' }
                            ]);
                            script.addFunction('noParam', mock);
                            return [4 /*yield*/, script.run()];
                        case 1:
                            _a.sent();
                            expect(mock).toHaveBeenCalledWith([3, 4]);
                            return [2 /*return*/];
                    }
                });
            }); }));
        });
        it('handles a function with a named object parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            {
                                withParam: {
                                    myVal: {
                                        obj: true
                                    }
                                }
                            }
                        ]);
                        script.addFunction('withParam', function (myVal) { mock.apply(mock, arguments); });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith({ obj: true });
                        return [2 /*return*/];
                }
            });
        }); }));
        it('handles a function with a named array parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            {
                                withParam: {
                                    myVal: [1, 2]
                                }
                            }
                        ]);
                        script.addFunction('withParam', function (myVal) { mock.apply(mock, arguments); });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith([1, 2]);
                        return [2 /*return*/];
                }
            });
        }); }));
        it('handles a function with a named variable parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            {
                                withParam: {
                                    myVal: '$val'
                                }
                            }
                        ]);
                        script.addFunction('withParam', function (myVal) { mock.apply(mock, arguments); });
                        return [4 /*yield*/, script.run({ val: 1234 })];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith(1234);
                        return [2 /*return*/];
                }
            });
        }); }));
        it('handles a function with a named inline javascript parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            {
                                withParam: {
                                    myVal: '${3 * 2}'
                                }
                            }
                        ]);
                        script.addFunction('withParam', function (myVal) { mock.apply(mock, arguments); });
                        return [4 /*yield*/, script.run()];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith(6);
                        return [2 /*return*/];
                }
            });
        }); }));
        it('handles a function with a named variable parameter', testAsync(function () { return __awaiter(_this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        script = getScript([
                            {
                                withParam: {
                                    myVal: '$val'
                                }
                            }
                        ]);
                        script.addFunction('withParam', function (myVal) { mock.apply(mock, arguments); });
                        return [4 /*yield*/, script.run({ val: 1234 })];
                    case 1:
                        _a.sent();
                        expect(mock).toHaveBeenCalledWith(1234);
                        return [2 /*return*/];
                }
            });
        }); }));
    });
});
function getScript(steps) {
    return new Script_1.Script({
        name: 'test script',
        steps: steps
    });
}
//# sourceMappingURL=Script.tests.js.map