module.exports = {
    warning: {
			script_does_not_contain_steps: "Script does not contain any steps"
		},
    error: {
        step_does_not_contain_run_property: "Step does not contain a 'run' property",
        run_function_does_not_exist: "No function '{0}' was found",
        unrecognized_assertion: "Unrecognized assertion '{0}'",
        assertion_must_have_two_parameters: "Assertion '{0}' must have 'expected' and 'actual' parameters",
        assertion_failed: "Assertion failed",
        no_variable_specified: "Assignment statement must have a variable name",
        repeat_function_must_contain_times_parameter: "Repeat function must contain a 'times' parameter",
        repeat_function_must_contain_steps_parameter: "Repeat function must contain a 'steps' parameter",
        repeat_function_must_contain_at_least_one_step: "Repeat function must contain at least one step",
        scenarios_function_must_contain_cases_parameter: "Scenarios function must contain a 'cases' parameter",
        scenarios_function_must_contain_at_least_one_case: "Scenarios function must contain at least one case",
        scenarios_function_must_contain_steps_parameter: "Scenarios function must contain a 'steps' parameter",
        scenarios_function_must_contain_at_least_one_step: "Scenarios function must contain at least one step",
        invalid_module_format_separate_items: "Invalid module format: each module must be a separate item"
    }
}