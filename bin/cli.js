#!/usr/bin/env node

var cli = require("../lib/cli")

cli.run(process.argv)
    .then(function (isSuccess) { 
        process.exit(isSuccess ? 0 : 1) 
    })
    .catch(function () { 
        process.exit(1);
     })