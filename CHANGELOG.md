# Pumlhorse Version History

## v2.4.0 (FIX ME)

* Added `when` statement for conditional execution of steps
* Pass scope to ScriptStarting and ScriptFinished filters
* Fixed issue with modules not being loaded in scripts using `run`
* Removed erroneous "Script does not contain any steps" message in `if` calls

## v2.3.3 (April 19, 2017)

* Cleanup steps returning promises are performed in order (#42)

## v2.3.2 (April 18, 2017)

* Property handle steps added through `$scope._cleanup()` that return promises (#40)

## v2.3.1 (April 16, 2017)

* Fixed bug with `requireFromPath.resolve`

## v2.3.0 (April 16, 2017)

* Allow modules to be imported from puml_modules folder (#23)
* Reference partial scripts (#24)
* Allow functions to write debug information (#21)
* Set default headers/authorization on HTTP calls (#30)

### Bugs

* Script won't throw error when calling end (#31)

## v2.2.0 (March 26, 2017)

* Added `prompt` function to allow soliciting values from the user (#13)
* Added `date` function to easily generate dates (#20)
* Added `convertText` function to convert to/from base64 and other encodings (#16)
* Added support for customer injectors for module functions (#18)
* Fixed issue with Pumlhorse not running on platforms with case-sensitive file paths (#19)

## v2.1.2 (March 12, 2017)

* Resolved issue with latest code not being published

## v2.1.1 (March 12, 2017)

* Fixed intermittent issue with JSON data not being populated on HTTP calls. Fun fact, `RegExp.test()` is _not_ idempotent.

## v2.1.0 (March 12, 2017)

* Added CancellationToken support. Calling frameworks can prematurely end a run
* Added `http` as a namespaced default module. No need to manually include it in every script
* Added more status code assertions: `isClientError`, `isServerError`, `isCreated`, `isAccepted`, `isNoContent`
* Automatically deserialize JSON HTTP body and store in `json` property on response (if `content-type` header is `application/json` or `text/json`)
* Fixed issue with variable references that end in a period, e.g. `log: My name is $name. Full stop.`
* Fixed issue with `toJson` not producing valid JSON

## v2.0.0 (February 11, 2017)

* Rewrote engine in TypeScript
* A bunch of other stuff

## v1.2.1 (November 25, 2016)

* Added ability to call functions on objects
* Added `$end` function to prematurely end a script without returning an error

## v1.2.0 (November 25, 2016)

* Added `if` function for conditional paths
* Added `parallel` function for running multiple paths simultaneously 
* Added `isNull` and `isNotNull` assertions
* Added `$id` to generate a UUID