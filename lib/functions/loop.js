var helpers = require("../helpers")
var i18n = require("../script.i18n")
var Promise = require("bluebird")
var _ = require("underscore")

        
var mod = pumlhorse.module("loop")
    .function("for", ["each", "in", "steps", forFunction], {
        deferredParameters: ["steps"]
    })
    .function("repeat", ["times", "steps", repeatFunction], {
        deferredParameters: ["steps"]
    })
    .function("scenarios", ["cases", "steps", "base", scenariosFunction], {
        deferredParameters: ["steps"]
    })
module.exports = mod.asExport();
 
function forFunction(each, inList, steps) {
    if (!each) throw new Error("For function must contain 'each' parameter")
    if (!inList) throw new Error("For function must contain 'in' parameter")
    if (!steps) throw new Error("For function must contain 'steps' parameter")
    if (steps.length == 0) throw new Error("For function must contain at least one step")
    
    var scope = this;
    return Promise.each(inList, function (item) {
        var newScope = scope.$new()
        helpers.assignObjectByString(newScope, each, item);
        return scope.$runSteps(steps, newScope)
    })
}

function repeatFunction(times, steps) {
    if (!times) {
        throw new Error(i18n.error.repeat_function_must_contain_times_parameter);
    }

    if (!steps) {
        throw new Error(i18n.error.repeat_function_must_contain_steps_parameter);
    }

    if (!steps.length || steps.length == 0) {
        throw new Error(i18n.error.repeat_function_must_contain_at_least_one_step);
    }

    var iterations = 0;

    var scope = this;
    return promiseWhile(function () { 
        return iterations < times; 
        },
        function () {
            iterations++;
            return scope.$runSteps(steps, scope.$new())
        });
}

function scenariosFunction(cases, steps, baseCase) {
    if (!cases) {
        throw new Error(i18n.error.scenarios_function_must_contain_cases_parameter);
    }
    
    var caseCount = helpers.itemCount(cases);
    
    if (!caseCount || caseCount == 0) {
        throw new Error(i18n.error.scenarios_function_must_contain_at_least_one_case);
    }

    if (!steps) {
        throw new Error(i18n.error.scenarios_function_must_contain_steps_parameter);
    }

    if (!steps.length || steps.length == 0) {
        throw new Error(i18n.error.scenarios_function_must_contain_at_least_one_step);
    }
    var scope = this;
    
    var keys = helpers.isArray(cases)
        ? _.range(cases.length)
        : _.keys(cases);    
    
    return Promise.each(keys, function (key) {
        var caseVal = cases[key];
        var fullCase = _.extend({}, baseCase, caseVal);
        return scope.$runSteps(steps, scope.$new(fullCase))
            .catch(function (e) {
                e.message = "Scenario '" + key + "' failed: " + e.message;
                throw e;
            })
    })
}

var promiseWhile = Promise.method(function(condition, action) {
    if (!condition()) return;
    return action().then(promiseWhile.bind(null, condition, action));
});



