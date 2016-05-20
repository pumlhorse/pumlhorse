var Proxyquire = require("proxyquire")
var Promise = require("bluebird")
var path = require("path")

var appMock

var fsMock = {
    readdir: function () { },
    readFile: function () { },
    stat: function () { },
    readAsYaml: function () {},
    readAsJson: function () {},
    readdirRecursive: function () {}
}

describe("Command line", function () {

    var yamlMock = {
        parse: function () {}
    }
    
    var files;
    var directories;
    beforeEach(function () {
        appMock = {
            runProfile: jasmine.createSpy("runProfile").and.returnValue(Promise.resolve({}))
        }
        spyOn(console, "timeEnd") //quiet the output
    })
    
    function runCli(args) {
        var cli = Proxyquire("../lib/cli", {
            "./promiseFs": fsMock,
            "pumlhorse-yamljs": yamlMock,
            "./app": appMock,
            "@noCallThru": true
        })
        
        if (!args) {
            args = []
        }
        args.splice(0, 0, "node", "test")
        
        return cli.run(args)
    }
    
    it("passes empty profile for zero args", function (done) {
        //Arrange
        
        
        //Act
        var promise = runCli()
        
        //Assert
        promise.then(function () {
            expect(appMock.runProfile).toHaveBeenCalledWith(
                jasmine.objectContaining({}), jasmine.any(Object)
            )
        })
            .finally(assertPromiseResolved(promise, done))
        
    });    
    
    it("passes files and directories", function (done) {
        //Arrange
        
        
        //Act
        var promise = runCli(["file1", "dir1", "file2"])
        
        //Assert
        promise.then(function () {
            expect(appMock.runProfile).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    include: ["file1", "dir1", "file2"]
                }), jasmine.any(Object)
            )
        })
            .finally(assertPromiseResolved(promise, done))
        
    });   
    
    it("passes contexts", function (done) {
        //Arrange
        
        
        //Act
        var promise = runCli(["file1", "-c", "context1", "-c", "context2"])
        
        //Assert
        promise.then(function () {
            expect(appMock.runProfile).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    include: ["file1"],
                    contexts: ["context1", "context2"]
                }), jasmine.any(Object)
            )
        })
            .finally(assertPromiseResolved(promise, done))
    });
    
    it("can run synchronously", function (done) {
        //Arrange
        
        
        //Act
        var promise = runCli(["file1", "--sync"])
        
        //Assert
        promise.then(function () {
            expect(appMock.runProfile).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    include: ["file1"],
                    synchronous: true
                }), jasmine.any(Object)
            )
        })
            .finally(assertPromiseResolved(promise, done))
    });
    
    it("can run recursively", function (done) {
        //Arrange
        
        
        //Act
        var promise = runCli(["file1", "-r"])
        
        //Assert
        promise.then(function () {
            expect(appMock.runProfile).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    include: ["file1"],
                    recursive: true
                }), jasmine.any(Object)
            )
        })
            .finally(assertPromiseResolved(promise, done))
    });
    
    it("can limit the number of concurrent steps", function (done) {
        //Arrange
        
        
        //Act
        var promise = runCli(["file1", "--max-concurrent", "45"])
        
        //Assert
        promise.then(function () {
            expect(appMock.runProfile).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    include: ["file1"],
                    maxConcurrent: 45
                }), jasmine.any(Object)
            )
        })
            .finally(assertPromiseResolved(promise, done))
    });
    
    describe("with profiles", function () {
        
        it("throws error if profile file type is not supported", function (done) {
            //Arrange
            spyOn(console, "error")
            
            //Act
            var promise = runCli(["file1", "--profile", "profile.yml"])

            promise.catch(function (err) {
                //Assert
                expect(err.message).toBe("Profile file must be .pumlprofile")
            })
                .finally(assertPromiseRejected(promise, done))
        });
        
        it("throws error if profile file does not exist", function (done) {
            //Arrange
            spyOn(fsMock, "stat").and.returnValue(getMockPromise(null, new Error("DOES NOT EXIST")))
            spyOn(console, "error")
            
            //Act
            var promise = runCli(["file1", "--profile", "profile.pumlprofile"])

            promise.catch(function (err) {
                //Assert
                expect(err.message).toBe("'profile.pumlprofile' does not exist")
            })
                .finally(assertPromiseRejected(promise, done))
        });
    
        it("can pass a profile file", function (done) {
            //Arrange
            spyOn(fsMock, "stat").and.returnValue(getMockPromise(
                {
                    isFile: function () { return true },
                    isDirectory: function () { return false }
                }))
            var profile = {
                val1: 1,
                val2: "2"
            }
            spyOn(fsMock, "readAsYaml").and.returnValue(profile)
            
            //Act
            var promise = runCli(["file1", "--profile", "profile.pumlprofile"])
            
            //Assert
            promise.then(function () {
                expect(fsMock.stat).toHaveBeenCalledWith(path.resolve("profile.pumlprofile"))
                expect(fsMock.readAsYaml).toHaveBeenCalledWith(path.resolve("profile.pumlprofile"))
                expect(appMock.runProfile).toHaveBeenCalledWith(profile, jasmine.any(Object))
            })
                .finally(assertPromiseResolved(promise, done))
        });
        
        it("defaults to current directory if no files/dirs are specified", function (done) {
            //Arrange
            spyOn(fsMock, "stat").and.returnValue(getMockPromise(
                {
                    isFile: function () { return true },
                    isDirectory: function () { return false }
                }))
            var profile = {}
            spyOn(fsMock, "readAsYaml").and.returnValue(profile)
            
            //Act
            var promise = runCli(["--profile", "profile.pumlprofile"])
            
            //Assert
            promise.then(function () {
                expect(appMock.runProfile).toHaveBeenCalledWith(jasmine.objectContaining({
                    include: ["."]
                }), jasmine.any(Object))
            })
                .finally(assertPromiseResolved(promise, done))            
        });
        
        it("uses parameter if current directory is specified", function (done) {
            //Arrange
            spyOn(fsMock, "stat").and.returnValue(getMockPromise(
                {
                    isFile: function () { return true },
                    isDirectory: function () { return false }
                }))
            var profile = {}
            spyOn(fsMock, "readAsYaml").and.returnValue(profile)
            
            //Act
            var promise = runCli([".", "--profile", "profile.pumlprofile"])
            
            //Assert
            promise.then(function () {
                expect(appMock.runProfile).toHaveBeenCalledWith(jasmine.objectContaining({
                    include: ["."]
                }), jasmine.any(Object))
            })
                .finally(assertPromiseResolved(promise, done))            
        });
        
        
        it("supports additional parameters with profile", function (done) {
            //Arrange
            spyOn(fsMock, "stat").and.returnValue(getMockPromise(
                {
                    isFile: function () { return true },
                    isDirectory: function () { return false }
                }))
            var profile = {
                include: ["file3", "file4"]
            }
            spyOn(fsMock, "readAsYaml").and.returnValue(profile)
            
            //Act
            var promise = runCli(["file1", "-r", "--profile", "profile.pumlprofile"])
            
            //Assert
            promise.then(function () {
                expect(appMock.runProfile).toHaveBeenCalledWith(
                    jasmine.objectContaining({
                        include: [path.resolve("file3"), path.resolve("file4"), "file1"],
                        recursive: true
                    }), 
                    jasmine.any(Object))
            })
                .finally(assertPromiseResolved(promise, done))
        });
        
        
    })


    function assertPromiseResolved(promise, doneFunc) {
        return function () {
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