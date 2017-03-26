function printMessage($today) {
    this.log("You are successfully using a custom module!")
    this.log("Today's date is " + $today.toLocaleDateString())
}

pumlhorse.module("myCustomModule")
    .function("printCustomModuleMessage", printMessage)
    .injector("$today", ($scope) => { return new Date(); })