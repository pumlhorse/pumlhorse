
# Pumlhorse

- PUML *(Promise-driven Utility Modeling Language)*
- Horse *(Equus caballus)*

Pumlhorse is a utility for creating readable and reusable scripts. 

For a complete reference, visit [pumlhorse.com](http://www.pumlhorse.com)

- Writing scripts
  - [Basic usage](#spec)
   - [Passing parameters](#parameters)
   - [Variables](#variables)
   - [Inline JavaScript](#inline-javascript)
   - [Conditionals](#conditionals)
   - [Loops](#loops)
   - [Logging](#logging)
  - [Assertions](#assertions)
  - [HTTP requests](#http)
  - [Timers](#timers)
  - [Parallel tasks](#parallel)
  - [Helpers](#helpers)

<a name="spec"></a>

# Specification

```yaml
name: Introduction to PUMLHorse
description: This is a basic script that writes some messages
steps:
  - log: Hello!
  - log: Goodbye!
```
<a name="parameters"></a>

## Parameters

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

## Variables

```yaml
name: Pass variables
description: Set and use variables from your steps
steps:
  - myName = John Smith
  - sayGreeting:
      text: Hello, my name is $myName
```

```yaml
name: Assign step results to variables
steps:
  #getMyName is a function that returns a string
  - myName = getMyName 
  - sayGreeting:
      text: Hello, my name is $myName
```

```yaml
name: Use complex objects in variables
steps:
  #getMyInfo is a function that returns { name: 'John Smith' }
  - myInfo = getMyInfo
  - sayGreeting:
      text: Hello, my name is $myInfo.name
```

```yaml
name: Create complex objects as variables
steps:
  - myInfo = value:
      name: John Smith
      age: 34 
  - sayGreeting:
      text: Hello, my name is $myInfo.name
```

<a name="inlineJavaScript"></a>

## Inline Javascript

```yaml
name: Use JavaScript inline
steps:
  - myMixedCase = aBcDeFg
  - myLowerCase = $myMixedCase.toLowerCase()
  #myLowerCase is now 'abcdefg'
```

```yaml
name: Declare JavaScript functions inline
functions:
  getMyInfo: return { name: 'John Smith', age: 25 }
  logMyInfo:
    # list parameters first 
    - age
    - name
    # list function body last
    - this.log('My name is ' + name + ' and I am ' + age + ' years old')
steps:
  - myInfo = getMyInfo
  - logMyInfo:
      name: $myInfo.name
      age: $myInfo.age
  # logs "My name is John Smith and I am 25 years old"
```

<a name="conditionals"></a>

## Conditionals

```yaml
name: Simple if/then example
functions:
  getTodaysDate:
    - return new Date().getDay()
steps:
  - dayOfWeek = $getTodaysDate()
  - if:
      value: ${ dayOfWeek == 5 }
      is true:
        - log: Congratulations, today is Friday!
      is false:
        - if:
            value: ${ dayOfWeek == 6 || dayOfWeek == 0}
            is true:
              - log: Congratulations, it's the weekend!
            is false:
              - log: Hang in there, you'll make it to the weekend!
```
<a name="loops"></a>

## Loops

```yaml
name: Run some things a few times
steps:
  - loopTimes = 14
  - repeat:
      times: $loopTimes
      steps:
        - log: Starting loop
        # do loop steps
        - log: Ending loop
```

```yaml
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
```

```yaml
name: Run a loop with varying data
functions:
  doLogin: 
    - username
    - password
    - this.log('Login with ' + username + ':' + password)
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

## Logging

```yaml
name: Basic logging functions
steps:
  - log: Here's a simple log message
  - warn: Something might be wrong
  - error: Something is definitely wrong!
```

```yaml
name: Pass parameters to logging calls
steps:
  - myFavoriteNumber = 42
  - warn: Every tech thing has to have a $myFavoriteNumber reference
```

<a name="assertions"></a>

## Assertions

```yaml
name: Use assertions
steps:
  # all of these assertions succeed
  - isTrue: ${5 == 7 - 2}
  - isFalse: ${Math.PI == 3}
  - isNull: $fhqwhgads # Variable doesn't exist
  - isNotNull: 42
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

## HTTP Methods

```yaml
name: Use HTTP methods
steps:
  - findUserResult = http.get:
      url: http://www.tempuri.org/api/findUser
      data: 
        search: jsmith
        page: 2
  # Issues GET request to http://www.tempuri.org/api/findUser?search=jsmith&page=2
  - log: $findUserResult.json.username
  # Logs 'username' property of the JSON response body (requires the content-type to be application/json or text/json)
  - postResult = http.post:
      url: http://www.tempuri.org/api/createUser
      data: 
        firstName: John
        lastName: Smith
      headers:
        Authorization: bearer   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQyLCJ1c2VybmFtZSI6ImVhc3Rlci5lZ2cifQ.U4nejjGFvXSERKtVWrgXXytXqe9oqdg8ws1AyLCp  4o0
  # Issues POST request to http://www.tempuri.org/api/createUser with a JSON request of { "firstName": "John", "lastName": "Smith" }
  - http.isOk: $postResult
  # Asserts that the response was a 200
  - log: $postResult.body #body contains the string content in the response
  # put, delete, patch, head, and options are also available 
```

<a name="timers"></a>

## Timers

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
```

```yaml
name: See how long we waited
functions:
  doLongRunningProcess:
    - return this.wait(2000)
steps:
  - timer1 = startTimer
  - doLongRunningProcess
  - stopTimer: $timer1
  - log: That took $timer1.seconds seconds
```

<a name="parallel"></a>

## Parallel tasks

```yaml
name: Run multiple steps in parallel
steps:
  - parallel:
      - postUpdateToFacebook: This is my new status!
      - postUpdateToTwitter: This is my new tweet!
      - postUpdateToInstagram: This is a picture of my cat!
functions:
  postUpdateToFacebook:
    - status
    - return this.wait(Math.random() * 1000).then(() => this.log('Updated status to ' + status))
  postUpdateToTwitter:
    - tweet
    - return this.wait(Math.random() * 1000).then(() => this.log('Added new tweet:' + tweet))
  postUpdateToInstagram:
    - caption
    - return this.wait(Math.random() * 1000).then(() => this.log('Added new picture with caption:' + caption))
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
