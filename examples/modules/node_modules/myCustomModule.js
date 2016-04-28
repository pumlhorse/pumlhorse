function printMessage() {
    this.log("You are successfully using a custom module!")
}

pumlhorse.module("myCustomModule")
    .function("printCustomModuleMessage", printMessage)