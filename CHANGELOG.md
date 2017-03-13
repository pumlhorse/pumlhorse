# Pumlhorse Version History

## v2.1.2

* Resolved issue with latest code not being published

## v2.1.1

* Fixed intermittent issue with JSON data not being populated on HTTP calls. Fun fact, `RegExp.test()` is _not_ idempotent.

## v2.1.0

* Added CancellationToken support. Calling frameworks can prematurely end a run
* Added `http` as a namespaced default module. No need to manually include it in every script
* Added more status code assertions: `isClientError`, `isServerError`, `isCreated`, `isAccepted`, `isNoContent`
* Automatically deserialize JSON HTTP body and store in `json` property on response (if `content-type` header is `application/json` or `text/json`)
* Fixed issue with variable references that end in a period, e.g. `log: My name is $name. Full stop.`
* Fixed issue with `toJson` not producing valid JSON

## v2.0.0

* Rewrote engine in TypeScript
* A bunch of other stuff

## v1.2.1

* Added ability to call functions on objects
* Added `$end` function to prematurely end a script without returning an error

## v1.2.0

## Functions
* Added `if` function for conditional paths
* Added `parallel` function for running multiple paths simultaneously 
* Added `isNull` and `isNotNull` assertions
* Added `$id` to generate a UUID