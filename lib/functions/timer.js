function startTimer(timer) {
    if (timer && timer.constructor === Timer) {
        timer.start()
        return timer
    }
    return new Timer()
}

function stopTimer(timer) {
    if (!timer || timer.constructor !== Timer) throw new Error("You must specify a timer to stop")
        
    timer.stop()
}

function Timer() {
    this.start()
}
Timer.prototype.start = function () {
    this.startDate = new Date()
    this.stopDate = null
}
Timer.prototype.stop = function () {
    this.stopDate = new Date()
    calculateElapsed(this)
}

function calculateElapsed(timer) {
    function getMeasurement(timer, factor) {
        return Math.floor(timer.milliseconds / factor)
    }
    
    timer.milliseconds = timer.stopDate - timer.startDate
    timer.seconds = getMeasurement(timer, 1000)
    timer.minutes = getMeasurement(timer, 1000 * 60)
    timer.hours = getMeasurement(timer, 1000 * 60 * 60)
    timer.days = getMeasurement(timer, 1000 * 60 * 60 * 24)
    
}


module.exports = pumlhorse.module("timer")
    .function("startTimer", startTimer)
    .function("stopTimer", stopTimer)
    .asExport();