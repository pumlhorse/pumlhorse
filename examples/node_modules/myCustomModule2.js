function printMessage() {
    this.log("You are successfully using ANOTHER custom module!")
}

pumlhorse.module("myCustomModule2")
    .function("printCustomModule2Message", printMessage)