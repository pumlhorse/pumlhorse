
# Pumlhorse

- PUML *(Promise-driven Utility Modeling Language)*
- Horse *(Equus caballus)*

Pumlhorse is a utility for creating readable and reusable scripts. 

You can skip to [the specification](#spec) or hit the high points
- [Basic usage](#spec)
 - [Passing parameters](#parameters)
 - [Variables](#variables)
 - [Inline JavaScript](#javascript)
 - [Loops](#loops)
 - [Logging](#logging)
- [Assertions](#assertions)
- [HTTP requests](#http)
- [Timers](#timers)
- [Helpers](#helpers)

##Running from console
 - [Run files](#cli)
 - [Run with contexts](#cliContext) 
 - [Run with a profile](#cliProfile) 

##Filters
 - [Inject filters into events](#filters)

##Custom modules
- [Using custom modules](#useModule)
- [Writing custom modules](#createModule)

<a name="spec"></a>
#Specification
```yaml
name: Introduction to PUMLHorse
description: This is a basic script that provides some information
author: John Smith
favoriteColor: mauve

========
name: Add some steps
description: A script isn't very useful if it can't do anything
steps:
  - log: Hello!
  - log: Goodbye!
```
<a name="parameters"></a>
##Parameters
```yaml
name: Use parameters
description: Pass some parameters to those steps
steps:
  - sayGreeting:
      text: Hello, and welcome to PumlHorse!
  - sayGoodbye:
      language: French
      text: Au revoir!
```
<a name="variables"></a>
##Variables
```yaml
name: Pass variables
description: Set and use variables from your steps
steps:
  - myName = John Smith
  - sayGreeting:
      text: Hello, my name is $myName

========
name: Assign step results to variables
steps:
  #getMyName is a function that returns a string
  - myName = getMyName 
  - sayGreeting:
      text: Hello, my name is $myName

========
name: Use complex objects in variables
steps:
  #getMyInfo is a function that returns { name: 'John Smith' }
  - myInfo = getMyInfo
  - sayGreeting:
      text: Hello, my name is $myInfo.name
========
name: Create complex objects as variables
steps:
  - myInfo = value:
      name: John Smith
      age: 34 
  - sayGreeting:
      text: Hello, my name is $myInfo.name
========
name: Manipulate variables
steps:
  - number1 = 5
  - number2 = 10
  - number3 = ${number1 + number2}
  - log: $number3
  #logs "15"
```


<a name="inlineJavaScript"></a>
##Inline Javascript
```yaml
name: Use JavaScript inline
steps:
  - myMixedCase = aBcDeFg
  - myLowerCase = $myMixedCase.toLowerCase()
  #myLowerCase is now 'abcdefg'

========
name: Declare JavaScript functions inline
functions:
  getMyInfo: return { name: 'John Smith', age: 25 }
  logMyInfo:
    # list parameters first 
    - age
    - name
    # list function body last
    - console.log('My name is ' + name + ' and I am ' + age + ' years old')
steps:
  - myInfo = getMyInfo
  - logMyInfo:
      name: $myInfo.name
      age: $myInfo.age
  # logs "My name is John Smith and I am 25 years old"
```
<a name="loops"></a>
##Loops
```yaml
name: Run some things a few times
steps:
  - loopTimes = 14
  - repeat:
      times: $loopTimes
      steps:
        - log: Starting loop
        - doLoopTasks
        - log: Ending loop
        
=====
name: Loop through items in a list
functions:
  getLoopItems: return ["a", "b", "c"]
steps:
  - items = getLoopItems
  - for:
      each: item
      in: $items
      steps:
        - log: Working with the letter $item
        - doLoopTasks: $item
=====
name: Run a loop with varying data
functions:
  doLogin: #login implementation
steps:
  - scenarios:
      base: # (optional) provides a base set of values for every scenario
        username: jsmith
      cases:
        bad password:
          password: abadpassword
        good password:
          password: aBeTTerPassw0rd!
      steps:
        - doLogin:
            username: $username
            password: $password
          #Performs doLogin for "bad password" and "good password" scenarios
```
<a name="logging"></a>
##Logging
```yaml
name: Basic logging functions
steps:
  - log: Here's a simple log message
  - warn: Something might be wrong
  - error: Something is definitely wrong!
  
========
name: Pass parameters to logging calls
steps:
  - log: 
      - We can pass some %s parameters
      - NEAT
  #Logs "We can pass some NEAT parameters
  - myFavoriteNumber = 42
  - warn: Every tech thing has to have a $myFavoriteNumber reference
  
```

<a name="assertions"></a>
##Assertions
```yaml
name: Use assertions
steps:
  # all of these assertions succeed
  - isTrue: ${5 == 7 - 2}
  - isFalse: ${Math.PI == 3}
  - areEqual: 
      expected: men 
      actual: ${"women".substr(2)}
  - areEqual:
      expected:
        game: horseshoe
      actual:
        game: horseshoe
        another: handgrenades
      partial: true # Only properties in expected value will be checked in actual value
  - areNotEqual:
      expected: free as in beer
      actual: free as in speech
  - isEmpty: ${[]}
  - isNotEmpty: ${[3, 4, 5]}
  - contains: 
    array: 
      - 4
      - 5
      - 6
    value: 6
  - contains:
      array:
        - game: horseshoe
          another: handgrenades
      value:
        game: horseshoe 
      partial: true
```
<a name="http"></a>
##HTTP Methods
```yaml
name: Use HTTP methods
steps:
  - get:
    url: http://www.tempuri.org/api/findUser
    data: 
      search: jsmith
      page: 2
  # Issues GET request to http://www.tempuri.org/api/findUser?search=jsmith&page=2
  - postResult = post:
    url: http://www.tempuri.org/api/createUser
    data: 
      firstName: John
      lastName: Smith
    headers:
      Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQyLCJ1c2VybmFtZSI6ImVhc3Rlci5lZ2cifQ.U4nejjGFvXSERKtVWrgXXytXqe9oqdg8ws1AyLCp4o0
  # Issues POST request to http://www.tempuri.org/api/createUser with a JSON request of { "firstName": "John", "lastName": "Smith" }
  - areEqual: 
      expected: 200
      actual: $postResult.statusCode
  - log: $postResult.body #body contains the string content in the response
  # put, delete, patch, head, and options are also available 
```

<a name="timers"></a>
##Timers
```yaml
name: Wait for an amount of time
steps: 
  - wait:
      milliseconds: 23
      seconds: 45
  - log: Well that was kinda long
  # Waits for 45.023 seconds
  - wait:
      minutes: 60
      hours: 3
  # Waits for four hours...use at your own discretion
  - log: Is anyone even here anymore?

=========
name: See how long we waited
steps:
  - timer1 = startTimer
  - doLongRunningProcess
  - stopTimer: $timer1
  - log:
      - that took %s seconds
      - $timer1.seconds
```

<a name="helpers"></a>
## Helpers

Some miscellaneous helpers
### JSON serialization
```yaml
name: Convert from string to object
functions:
  getObject: return { prop: 43 }
steps:
  - obj = getObject
  - jsonString = toJson: $obj
  - log: $jsonString #logs "{prop:43}"
  - newObj = fromJson: $jsonString 
  - log: $newObj.prop #logs "43"
```

<a name="cli"></a>
#Running from console
Pumlhorse supplies a command-line interface (CLI) for running .puml files. To install the CLI,
run `npm install -g pumlhorse`

Run all files in the current directory:
`pumlhorse`

Run all files in a specific directory: `pumlhorse somedir/someSubdir`

Run a specific file: `pumlhorse somedir/myScript.puml`

Run multiple directories and files: `pumlhorse testDir myScript.puml anotherDir`

Run all files in a directory and its sub-directories (recursive): `pumlhorse somedir -r`. 
* **NOTE**: 
be aware of what directories you're using when using `-r`. If you run it on a folder that has a lot of files or
folders that don't contain .puml files, it will unnecessarily take more time to run. 

### Running synchronously
By default, Pumlhorse will run all scripts asynchronously. This means that if one script is waiting for a long running process -- an HTTP GET, for example --
other scripts can run at the same time. The output will be shown in order of the scripts completing. 

If you care about the order in which the scripts are run,
you can use the `--sync` option to run scripts synchronously. 

`pumlhorse firstScript.puml secondScript.puml thirdScript.puml --sync`

### Limiting concurrent scripts
If you want to limit the number of scripts that run at one time (say, to avoid overloading a service or database), 
you can use the `--max-concurrent <max_number_of_scripts>` option.

`pumlhorse myScriptDirectory --max-concurrent 5`

<a name="cliContext"></a>
## Running with contexts
When running a script, you can also pass in a context - a collection of initial variables. For example, you could pass in configuration options like:
 - URL of API to hit, which changes between environments
 - Number of times to run part of a test
 - Login credentials

These values are then referenced like normal variables in the script.

To use a context with the CLI, use the `-c fileName` option. JSON (.json) and YAML (.yml) files
are supported. 

`pumlhorse myScript1.puml myScript.2.puml -c context_PROD.json`

### Multiple contexts
Occasionally, it may make sense to split your context into multiple files. Pass additional contexts in the same way.

`pumlhorse myScript1.puml -c context1.yml context2.yml`

Note that values will be applied in the order that context files are given. That is, if both context files above contain a
"username" value, context2.yml will override the value in context1.yml 

<a name="cliProfile"></a>
## Running a profile
All of the above CLI parameters can be packaged into a "profile". This profile is a `.pumlprofile` file would look something like this:
```yaml
include: #array of .puml files and/or directories to run
  - file1.puml
  - scriptDir
contexts: #array of .json or .yml files to use as the context
  - context1.yml
  - context2.json
recursive: <bool>
synchronous: <bool>
maxConcurrent: <number>
```

To pass a profile, use the `--profile <profile_name>` option

`pumlhorse --profile myProfile.pumlprofile`

You can still pass additional parameters when using a profile. If you pass files or directories or context files, they will be added to the profile.
The `-r`, `--sync`, and `--max-concurrent` options will override any values in the profile

<a name="filters"></a>
#Filters
Filters can handle the following events:
 - `onSessionStarting(): Promise<bool>`
   - Occurs after all files have been detected, but before any scripts have been loaded
 - `onScriptStarting(script: Script): Promise<bool>`
   - Occurs after a script has been loaded, but before it has run
 - `onScriptFinished(script: Script, isSuccess: bool): Promise<void>`
   - Occurs after a script has run. If the script was canceled through a filter,
   this event will still occur
 - `onSessionFinished(scriptCount: int, failedScripts: int): Promise<void>`
   - Occurs after all scripts have run. If the session was canceled through a filter,
   this event will still occur

As the name implies, the "starting" events can effectively cancel that event by throwing an error or returning false.
This can be used to perform some validation on the script, or just to run external processes. Some examples:
 - Cancel a test case if it doesn't have `testCaseId` specified
 - Mark test cases as passed/failed in an external system
 - Update an audit database after deployment scripts have been run 

Filters are implemented as javascript files. They are passed in via the `profile` option in the profile page.

See the `examples/filters` directory for sample implementations.

#External Modules
<a name="useModule"></a>
##Using modules
Pumlhorse supports multiple methods of resolving modules

### Node module
Reference a Pumlhorse module contained in a node module:
```yaml
name: Use my node module
modules:
  - my_pumlhorse_module: my_node_module
```

This would attempt to resolve `my_node_module` in the following locations:
 * Globally installed `node_modules` folder
 * `node_modules` folders along the `require` dependency resolution path **relative to the executing directory**
 (where `pumlhorse` was called, not where the `.puml` file lives
 * `puml_modules` in the `.puml` file's directory or parent directories.
 
If your node module and Pumlhorse module are named the same, you can use the following syntax.

```yaml
name: Node module shortcut
modules:
  - my_module
```

### Direct path
Reference a Pumlhorse module on the filesystem
```yaml
name: Use a file with an absolute path
modules:
  - my_module: C:/puml_modules/my_local_module.js
============
name: Use a file with a relative path
modules:
  - my_module: ../../puml_modules/my_local_module.js
```
Both of these approaches would load my_local_module.js and include the my_module Pumlhorse module in the script. A single JavaScript file
can declare more than one Pumlhorse module.

### Using module namespaces
To avoid running into conflicts between modules, or to provide more clarity, Pumlhorse allows modules
to be assigned a namespace. This is scoped to an individual script.
```yaml
name: Use a module with a namespace
modules:
  - site1 = my_site_helpers1 
  - site2 = my_site_helpers2 #avoid a conflict between the two modules
  - db = database: ../../database_helpers
steps:
  - site2.login: #call the login function from my_site_helpers2
      username: $username
      password: $password 
  - db.connect #call the connect function from database module
```

<a name="createModule"></a>
##Writing custom modules
If you find yourself writing the same function over and over in your scripts, you
might consider moving them to a module. All of Pumlhorse's functions are written as
modules.

To write a module, create a new JavaScript file and copy your functions there.
Then register your module with Pumlhorse as such:

```javascript
function myFunc() {
    //snip
}

function myFunc2() {
    //snip
}

var mod = pumlhorse.module("myModule")
    .function("myFunc", myFunc)
    .function("myFunc2", myFunc2)

//export as a Node.js module
module.exports = mod.asExport()
```

Now you need to place your file someplace where pumlhorse can reach it (refer to the Using Modules section above).
 * If you are using an absolute or relative path, you can place it anywhere you would like
 * If you are using a node module with a single file, you can simply place it in a `puml_modules` folder along the resolution path.
 * If you are using a node module with multiple files, you will need to place it in its own folder with whatever name you
 want for the module. You will also need to create a package.json for it.
   * For example, we want to create "cool_module", so we put our code into `app.js`.
   * We create a folder `cool_module` and move `app.js` into it.
   * `app.js` needs `library.js`, so we move that into the new folder as well.
   * We then create a file `package.json` in the same folder. In `package.json`, 
   we write the following: `{ "main": "app.js" }`
   * Finally, we move the `cool_module` folder into a `puml_modules` folder in the same directory
   as our scripts.

### Directory structure
As mentioned earlier, Pumlhorse will look at parent directories to find a node module. This allows you to
share modules across many scripts, or limit it to a smaller set. Here is a sample directory structure.

```
pumlhorse_scripts
├───login
│   │   login_test1.puml
│   │   login_test2.puml
│   │   login_test3.puml
│   │
│   └───puml_modules
│       └───login_helpers
│               app.js
                library.js
│               package.json
│
├───puml_modules
│       site_helpers.js
│
└───user_management
        user_management_test1.puml
        user_management_test2.puml
        user_management_test3.puml
```

In this example, the scripts in the `login` directory will have access to both 
the `login_helpers` and `site_helpers` modules. The `user_management` tests will only
have access to `site_helpers`.

### Minification support

If you want to minify your file, you can use angular-style syntax for declaring your functions.
```javascript
function myFunc(inputParam1, anotherParam) {
    //Do something with parameters
}

pumlhorse.module("myModule")
    .function("aliasForMyFunc", ["inputParam1", "aliasForAnotherParam", myFunc])
}
```


### Deferred evaluation
In some cases, you will want to defer evaluation of a certain parameter. For instance, the `repeat` function has a `steps` parameter, which should 
not be evaluated until that step is run.
```yaml
steps:
  - loopTimes = 4
  - repeat:
      times: $loopTimes
      steps: #innerSteps
        - myName = Joseph
        - log: $myName
```
When PumlHorse parses the `repeat` step, it should evaluate `$loopTimes`, but not `steps`. The parser sees the steps as an array of parameters to be passed to a function.
The first inner step would be run again to assign 'Joseph' to `myName`, but the second step would have been evaluated before that assignment, so `$myName` would be undefined.

To defer evaluation for a parameter, you must declare it like so.
```javascript

function doSomething(input, dontEval) {
    //Do something with parameters    
}

pumlhorse.module("myModule")
    .function("doSomething", ["input", pumlhorse.defer("dontEval"), doSomething)
```