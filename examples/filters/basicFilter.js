pumlhorse.filter()
    .onSessionStarting(handleSessionStarting)
    .onScriptStarting(handleScriptStarting)
    .onScriptFinished(handleScriptFinished)
    .onSessionFinished(handleSessionFinished)


function handleSessionStarting() {
    console.log("Session starting...")
}

function handleScriptStarting(script) {
    console.log("Starting script " + script.name)
}

function handleScriptFinished(script) {
    console.log("Finished script " + script.name)
}

function handleSessionFinished() {
    console.log("Finished session")
}