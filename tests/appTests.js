var path = require("path")
var Proxyquire = require("proxyquire")
var Promise = require("bluebird")

var fsMock = {
    readdir: function () { },
    readFile: function () { },
    stat: function () { },
    readAsYaml: function () {},
    readAsJson: function () {},
    readdirRecursive: function () {}
}

describe("App", function () {
    
    var mockYamlResult = { test: "script" };
    var yamlMock 
    var mockScript
    var scriptMock
    var files;
    var directories;
    var loggerMock
    var sessionOutput

    filterNoop = function () { return Promise.resolve() }
    var filterMock = {
        onSessionStarting: filterNoop,
        onSessionFinished: filterNoop
    }
    
    var settingsMock = {
        addSetting: function () {}
    }
    
    beforeEach(function () {
        yamlMock = {
            parse: jasmine.createSpy("parse").and.returnValue(mockYamlResult)
        }
        mockScript = {
            run: jasmine.createSpy("run").and.returnValue(getMockPromise({})),
            addFunction: jasmine.createSpy("addFunction"),
            id: "mockScriptId"
        }
        scriptMock = jasmine.createSpy("script").and.returnValue(mockScript)
        
        files = [];
        directories = [];
        loggerMock = {
            log: jasmine.createSpy("log"),
            warn: jasmine.createSpy("warn"),
            error: jasmine.createSpy("error")
        }
        spyOn(fsMock, "stat").and.callFake(function (s) {
            var isFile = files.indexOf(s) > -1
            var isDirectory = directories.indexOf(s) > -1;
            if (isFile || isDirectory) {
                return getMockPromise(
                {
                    isFile: function () { return isFile },
                    isDirectory: function () { return isDirectory }
                });
            }
            return getMockPromise(null, new Error("DOES NOT EXIST"))
        });
        
        sessionOutput = {
            onSessionStarted: jasmine.createSpy(),
            onSessionFinished: jasmine.createSpy(),
            log: jasmine.createSpy(),
            onScriptPending: jasmine.createSpy(),
            onScriptStarted: jasmine.createSpy(),
            onScriptFinished: jasmine.createSpy(),
            onStepStarted: jasmine.createSpy(),
            onStepFinished: jasmine.createSpy(),
            onHttpSend: jasmine.createSpy(),
            onHttpReceive: jasmine.createSpy()
        } 
    })
    
    function runProfile(profile) {
        var app = Proxyquire("../lib/app", {
            "./promiseFs": fsMock,
            "./script": scriptMock,
            "pumlhorse-yamljs": yamlMock,
            "./filters": filterMock,
            "./settings": settingsMock,
            "@noCallThru": true
        })
        //app.setLoggers(loggerMock)
        
        return app.runProfile(profile, sessionOutput)
    }

    function addFile() {
        for (var i in arguments) {
            files.push(path.resolve(arguments[i]))
        }
    }
    
    function addDirectory() {
        for (var i in arguments) {
            directories.push(path.resolve(arguments[i]))
        }
    }

    function setDirFiles(fileNames) {
        spyOn(fsMock, "readdir").and.callFake(getMockPromiseFunc(fileNames))
    }

    function setFileValue(file) {
        spyOn(fsMock, "readFile").and.callFake(getMockPromiseFunc(file))
    }

    describe("run profile", function () {
        it("logs message if no scripts are found", function (done) {
            //Arrange
            setDirFiles([])
            addDirectory(".")
            
            //Act
            var promise = runProfile({
                include: ["."]
            });
            
            //Assert
            promise.then(function () {
                //Assert
                expect(scriptMock).not.toHaveBeenCalled()
                expect(sessionOutput.onSessionFinished).toHaveBeenCalledWith(0, 0)
            })
            .finally(assertPromiseResolved(promise, done))
        });


        it("runs all puml files if no parameter is passed ", function (done) {
            //Arrange
            addDirectory(".")
            setDirFiles(["file1.js", "file2.puml", "file3.puml", "file4.yml"])
            setFileValue("file text")
            
            //Act
            var promise = runProfile({
            });

            promise.then(function () {
                //Assert
                expect(fsMock.readdir).toHaveBeenCalledWith(path.resolve())
                expect(fsMock.readFile.calls.count()).toBe(2)
                expect(fsMock.readFile).toHaveBeenCalledWith(path.resolve("file2.puml"), "utf8")
                expect(fsMock.readFile).toHaveBeenCalledWith(path.resolve("file3.puml"), "utf8")
                expect(yamlMock.parse).toHaveBeenCalledWith("file text")
                expect(scriptMock).toHaveBeenCalledWith(mockYamlResult);
                expect(mockScript.run).toHaveBeenCalled()
            })
                .finally(assertPromiseResolved(promise, done))
        });
        
        it("logs events for each script", function (done) {
            //Arrange
            addDirectory(".")
            setDirFiles(["file1.js", "file2.puml", "file3.puml", "file4.yml"])
            setFileValue("file text")
            scriptMock = jasmine.createSpy("script").and.returnValues({
                id: "mockScriptId1",
                name: "script1",
                run: jasmine.createSpy("run").and.returnValue(getMockPromise({})),
                addFunction: jasmine.createSpy("addFunction"),
            },
            {
                id: "mockScriptId2",
                name: "script2",
                run: jasmine.createSpy("run").and.returnValue(getMockPromise({})),
                addFunction: jasmine.createSpy("addFunction"),
            })
            
            //Act
            var promise = runProfile({
            });

            promise.then(function () {
                //Assert
                expect(sessionOutput.onSessionStarted).toHaveBeenCalled()
                var file2 = path.resolve("file2.puml")
                var file3 = path.resolve("file3.puml")
                expect(sessionOutput.onScriptPending).toHaveBeenCalledWith("mockScriptId1", file2, "script1")
                expect(sessionOutput.onScriptPending).toHaveBeenCalledWith("mockScriptId2", file3, "script2")
                expect(sessionOutput.onScriptStarted).toHaveBeenCalledWith("mockScriptId1")
                expect(sessionOutput.onScriptStarted).toHaveBeenCalledWith("mockScriptId2")
                expect(sessionOutput.onScriptFinished).toHaveBeenCalledWith("mockScriptId1", null)
                expect(sessionOutput.onScriptFinished).toHaveBeenCalledWith("mockScriptId2", null)
                expect(sessionOutput.onSessionFinished).toHaveBeenCalledWith(2, 0)
            })
                .finally(assertPromiseResolved(promise, done))
        });
        


        it("logs a message for all scripts run", function (done) {
            //Arrange
            addDirectory(".")
            setDirFiles(["file1.js", "file2.puml", "file3.puml", "file4.yml"])
            setFileValue("file text")
            
            //Act
            var promise = runProfile({
            });

            promise.then(function () {
                //Assert
                expect(sessionOutput.onSessionFinished).toHaveBeenCalledWith(2, 0)
                //expect(sessionOutput).toHaveBeenCalledWith("log", "%s scripts run, %s %s", 2, 0, "failures")
            })
                .finally(assertPromiseResolved(promise, done))
        });
        
        it("throws error if context file type is not supported", function (done) {
            //Arrange
            
            //Act
            var promise = runProfile({
                contexts: ["context.yml2"],
                include: []
            });

            promise.catch(function (err) {
                //Assert
                expect(err.message).toBe("Context file must be .json or .yaml")
            })
                .finally(assertPromiseRejected(promise, done))
        });
        
        it("throws error if context file does not exist", function (done) {
            //Arrange
            
            //Act
            var promise = runProfile({
                contexts: ["context.yml"],
                include: []
            });

            promise.catch(function (err) {
                //Assert
                expect(err.message).toBe("'context.yml' does not exist")
            })
                .finally(assertPromiseRejected(promise, done))
        });
        
        it("runs with a specified YAML (.yaml) context", function (done) {
            //Arrange
            addDirectory(".")
            addFile("context.yaml")
            setDirFiles(["file2.puml"])
            setFileValue("file text")
            var context = {
                f: 9
            }
            spyOn(fsMock, "readAsYaml").and.returnValue(context)
            
            //Act
            var promise = runProfile({
                contexts: ["context.yaml"]
            });

            promise.then(function () {
                //Assert
                expect(fsMock.readAsYaml).toHaveBeenCalledWith(path.resolve("context.yaml"))
                expect(mockScript.run).toHaveBeenCalledWith(context)
            })
                .finally(assertPromiseResolved(promise, done))
        });
        
        it("runs with a specified YAML (.yml) context", function (done) {
            //Arrange
            addDirectory(".")
            addFile("context.yml")
            setDirFiles(["file2.puml"])
            setFileValue("file text")
            var context = {
                f: 9
            }
            spyOn(fsMock, "readAsYaml").and.returnValue(context)
            
            //Act
            var promise = runProfile({
                contexts: ["context.yml"]
            });

            promise.then(function () {
                //Assert
                expect(fsMock.readAsYaml).toHaveBeenCalledWith(path.resolve("context.yml"))
                expect(mockScript.run).toHaveBeenCalledWith(context)
            })
                .finally(assertPromiseResolved(promise, done))
        });
        
        it("runs with a specified JSON context", function (done) {
            //Arrange
            addDirectory(".")
            addFile("context.json")
            setDirFiles(["file2.puml"])
            setFileValue("file text")
            var context = {
                f: 9
            }
            spyOn(fsMock, "readAsJson").and.returnValue(context)
            
            //Act
            var promise = runProfile({
                contexts: ["context.json"]
            });

            promise.then(function () {
                //Assert
                expect(fsMock.readAsJson).toHaveBeenCalledWith(path.resolve("context.json"))
                expect(mockScript.run).toHaveBeenCalledWith(context)
            })
                .finally(assertPromiseResolved(promise, done))
        });
        
        it("throws error if directory does not exist", function (done) {
            //Arrange
            
            //Act
            var promise = runProfile({
                include: ["some/dir"]
            });
            
            //Assert
            promise
            .catch(function (err) {
                //Assert
                expect(err.message).toBe("'some/dir' is not a file or directory")
            })
                .finally(assertPromiseRejected(promise, done))
        });

        it("logs message if no scripts are found", function (done) {
            //Arrange
            addDirectory("some/dir")
            setDirFiles(["file1.js", "file4.yml"])
            
            //Act
            var promise = runProfile({
                include: ["some/dir"]
            });
            
            //Assert
            promise.then(function () {
                //Assert
                expect(fsMock.readdir).toHaveBeenCalledWith(path.resolve("some/dir"))
                expect(scriptMock).not.toHaveBeenCalled();
                expect(sessionOutput.onSessionFinished).toHaveBeenCalledWith(0, 0)
            })
                .finally(assertPromiseResolved(promise, done))
        });

        it("runs all puml files in directories", function (done) {
            //Arrange
            addDirectory("some/dir1", "some/dir2")
            addFile("file3.js", "file3.puml")
            setDirFiles(["file1.js", "file2.puml"])
            setFileValue("file text")
            
            //Act
            var promise = runProfile({
                include: ["some/dir1", "some/dir2", "file3.js", "file3.puml"]
            });

            promise.then(function () {
                //Assert
                expect(fsMock.readdir).toHaveBeenCalledWith(path.resolve("some/dir1"))
                expect(fsMock.readdir).toHaveBeenCalledWith(path.resolve("some/dir2"))
                expect(fsMock.readFile.calls.count()).toBe(3)
                expect(fsMock.readFile).toHaveBeenCalledWith(path.resolve("some/dir1/file2.puml"), "utf8")
                expect(fsMock.readFile).toHaveBeenCalledWith(path.resolve("file3.puml"), "utf8")
                expect(yamlMock.parse).toHaveBeenCalledWith("file text")
                expect(scriptMock).toHaveBeenCalled()
                expect(mockScript.run).toHaveBeenCalled()
            })
                .finally(assertPromiseResolved(promise, done))
        });


        it("logs a message for all scripts run", function (done) {
            //Arrange
            addDirectory("some/dir1")
            addFile("file3.js", "file3.puml")
            setDirFiles(["file1.js", "file2.puml"])
            setFileValue("file text")
            
            //Act
            var promise = runProfile({
                include: ["some/dir1", "file3.js", "file3.puml"]
            });

            promise.then(function () {
                //Assert
                expect(sessionOutput.onSessionFinished).toHaveBeenCalledWith(2, 0)
            })
                .finally(assertPromiseResolved(promise, done))
        });

        it("-r option runs all puml files in directories recursively", function (done) {
            //Arrange
            addDirectory("some/dir1")
            spyOn(fsMock, "readdirRecursive").and.callFake(getMockPromiseFunc([
                "file2.puml",
                "file3.yml",
                "another/sub/dir/file4.puml"
            ]))
            addFile("file3.puml")
            setFileValue("file text")
            
            //Act
            var promise = runProfile({
                include: ["some/dir1", "file3.puml"],
                recursive: true
            });

            promise.then(function () {
                //Assert
                expect(fsMock.readdirRecursive).toHaveBeenCalledWith(path.resolve("some/dir1"));
                expect(fsMock.readFile).toHaveBeenCalledWith(path.resolve("some/dir1/file2.puml"), "utf8")
                expect(fsMock.readFile).toHaveBeenCalledWith(path.resolve("some/dir1/another/sub/dir/file4.puml"), "utf8")
                expect(fsMock.readFile).toHaveBeenCalledWith(path.resolve("file3.puml"), "utf8")
                expect(mockScript.run).toHaveBeenCalled()
            })
                .finally(assertPromiseResolved(promise, done))
        });
        
        it("runs scripts asynchronously", function (done) {
            //Arrange
            addFile("file1.puml", "file2.puml")
            setFileValue("file text")
            var value = 0;
            var script1Ran = false;
            var script2Ran = false;
            var script1Mock = {
                run: function () {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            value = 2;
                            script1Ran = true
                             resolve()
                        })
                    })
                 },
                addFunction: function () {}
            }
            var script2Mock = {
                run: function () {
                    return new Promise(function (resolve, reject) {
                        value = 1;
                        script2Ran = true
                        resolve()
                    })
                 },
                addFunction: function () {}
            }
            scriptMock = jasmine.createSpy().and.returnValues(script1Mock, script2Mock)
            
            //Act
            var promise = runProfile({
                include: ["file1.puml", "file2.puml"]
            });

            promise.then(function () {
                //Assert
                expect(script1Ran).toBe(true)
                expect(script2Ran).toBe(true)
                expect(value).toBe(2)
            })
                .finally(assertPromiseResolved(promise, done))
        });
        
        
        it("--sync option runs scripts synchronously", function (done) {
            //Arrange
            addFile("file1.puml", "file2.puml")
            setFileValue("file text")
            var value = 0;
            var script1Ran = false;
            var script2Ran = false;
            var script1Mock = {
                run: function () {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            value = 2;
                            script1Ran = true
                             resolve()
                        })
                    })
                 },
                addFunction: function () {}
            }
            var script2Mock = {
                run: function () {
                    return new Promise(function (resolve, reject) {
                        value = 1;
                        script2Ran = true
                        resolve()
                    })
                 },
                addFunction: function () {}
            }
            scriptMock = jasmine.createSpy().and.returnValues(script1Mock, script2Mock)
            
            //Act
            var promise = runProfile({
                include: ["file1.puml", "file2.puml"],
                synchronous: true
            });

            promise.then(function () {
                //Assert
                expect(script1Ran).toBe(true)
                expect(script2Ran).toBe(true)
                expect(value).toBe(1)
            })
                .finally(assertPromiseResolved(promise, done))
        });
        
        it("allows for a maximum number of concurrent scripts", function (done) {
            //Arrange
            addFile("file1.puml", "file2.puml", "file3.puml", "file4.puml")
            setFileValue("file text")
            var value = 0;
            var spy = jasmine.createSpy()
            var mockScript = {
                run: function () {
                    return new Promise(function (resolve, reject) {
                        value++
                        setTimeout(function () {
                            spy(value)
                            value--
                             resolve()
                        })
                    })
                 },
                addFunction: function () {}
            }
            scriptMock = jasmine.createSpy().and.returnValue(mockScript)
            
            //Act
            var promise = runProfile({
                include: ["file1.puml", "file2.puml", "file3.puml", "file4.puml"],
                maxConcurrentFiles: 2
            });

            promise.then(function () {
                //Assert
                expect(spy).toHaveBeenCalledWith(1)
                expect(spy).toHaveBeenCalledWith(2)
                expect(spy).not.toHaveBeenCalledWith(3)
                expect(spy).not.toHaveBeenCalledWith(4)
                expect(value).toBe(0)
            })
                .finally(assertPromiseResolved(promise, done))
        });
        
        it("adds any settings in the profile", function (done) {
            //Arrange
            addDirectory("some/dir1")
            addFile("file3.js", "file3.puml")
            setDirFiles(["file1.js", "file2.puml"])
            setFileValue("file text")
            spyOn(settingsMock, "addSetting")
            var profileSettings = {
                sample: "setting1",
                another: {
                    complex: "setting 2"
                }
            }
            
            //Act
            var promise = runProfile({
                include: ["file3.puml"],
                settings: profileSettings
            });

            promise.then(function () {
                //Assert
                expect(settingsMock.addSetting).toHaveBeenCalledWith("sample", "setting1")
                expect(settingsMock.addSetting).toHaveBeenCalledWith("another", profileSettings.another)
            })
                .finally(assertPromiseResolved(promise, done))
        });
        
        
        describe("with filters", function () {
        
            it("runs session filters", function (done) {
                //Arrange
                addFile("file1.puml")
                setFileValue("file text")
                spyOn(filterMock, "onSessionStarting").and.callThrough()
                spyOn(filterMock, "onSessionFinished").and.callThrough()
                
                //Act
                var promise = runProfile({
                    include: ["file1.puml"]
                });

                promise.then(function () {
                    //Assert
                    expect(filterMock.onSessionStarting).toHaveBeenCalled()
                    expect(filterMock.onSessionFinished).toHaveBeenCalled()
                    expect(filterMock.onSessionFinished).toHaveBeenCalledWith(1, 0)
                })
                    .finally(assertPromiseResolved(promise, done))
                
            });
            
            it("returns the number of failures in the session", function (done) {
                //Arrange
                addFile("file1.puml", "file2.puml", "file3.puml")
                setFileValue("file text")
                spyOn(filterMock, "onSessionStarting").and.callThrough()
                spyOn(filterMock, "onSessionFinished").and.callThrough()
                mockScript.run = jasmine.createSpy().and.returnValues(getMockPromise({}), getMockPromise(null, "error"), getMockPromise(null, "error"))
                
                //Act
                var promise = runProfile({
                    include: ["file1.puml", "file2.puml", "file3.puml"]
                });

                promise.then(function () {
                    //Assert
                    expect(filterMock.onSessionFinished).toHaveBeenCalledWith(3, 2)
                })
                    .finally(assertPromiseResolved(promise, done))
                
            });
            
            it("cancels the run if session starting filter returns rejection", function (done) {
                //Arrange
                addFile("file1.puml")
                setFileValue("file text")
                spyOn(filterMock, "onSessionStarting").and.returnValue(Promise.reject("An error"))
                spyOn(filterMock, "onSessionFinished").and.callThrough()
                
                //Act
                var promise = runProfile({
                    include: ["file1.puml"]
                });

                promise.catch(function (err) {
                    //Assert
                    expect(err).toBe("An error")
                    expect(mockScript.run).not.toHaveBeenCalled()
                    expect(filterMock.onSessionFinished).toHaveBeenCalledWith(0, 0)
                })
                    .finally(assertPromiseRejected(promise, done))
                
            });
        })
        
    })

    function assertPromiseResolved(promise, doneFunc) {
        return function () {
            if (promise.isRejected()) console.error(promise.reason())
            expect(promise.isFulfilled()).toBe(true);
            doneFunc();
        }
    }

    function assertPromiseRejected(promise, doneFunc) {
        return function () {
            expect(promise.isRejected()).toBe(true);
            doneFunc();
        }
    }

    function getMockPromiseFunc(result, err) {
        return function () {
            return getMockPromise(result, err);
        }
    }

    function getMockPromise(result, err) {
        return result ? Promise.resolve(result) : Promise.reject(err);
    }
})