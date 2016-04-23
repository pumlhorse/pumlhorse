var Proxyquire = require("proxyquire")
var Promise = require("bluebird")

describe("HTTP function", function () {
    
    var http
    var httpClientMock = {    }
    var httpClientFactoryMock = {
        getClient: function () { return httpClientMock; }
    } 
    var helperMock = {
        getDateTime: function () { return new Date() },
        getUniqueId: function () { }
    }
    var scopeMock = {
        $emit: function () {}
    }
    
    var verbs = ["get", "post", "put", "delete", "patch", "options", "head"]
    
    beforeEach(function () {
        verbs.forEach(function (v) {
            httpClientMock[v] = jasmine.createSpy()
        })
        httpClientMock.addHeader = jasmine.createSpy()
        
        http = Proxyquire("../../lib/functions/http", {
            "http-client-factory": httpClientFactoryMock,
            "../helpers": helperMock,
            "@noCallThru": true
        })
    })
    
    verbs.forEach(function (v) {
        
        it("throws exception if " + v + " URL is null", function () {
            //Arrange
            var body = { some: "body", items: "here"}
            
            try {
                //Act
                http[v](null, body)
                fail()
            }
            catch (error) {
                //Assert
                expect(error.message).toBe("URL is required")
            }
        })
        
        it("throws exception if " + v + " URL is empty", function () {
            //Arrange
            var body = { some: "body", items: "here"}
            
            
            try {
                //Act
                http[v]("", body)
                fail()
            }
            catch (error) {
                //Assert
                expect(error.message).toBe("URL is required")
            }
        })
        
        it("handles input to " + v, function (done) {
            //Arrange
            var body = { some: "body", items: "here"}
            httpClientMock[v] = jasmine.createSpy().and
                .returnValue(Promise.resolve(getMockResponse(200, "", "")))
            
            //Act
            var promise = http[v].call(scopeMock, "http://www.baseurl/some/path", body)
            
            promise.then(function () {
                //Assert
                expect(httpClientMock[v]).toHaveBeenCalledWith("http://www.baseurl/some/path", body)
            })
            .finally(assertPromiseResolved(promise, done))
        })
        
        it("handles input to " + v + " with null body", function (done) {
            //Arrange
            httpClientMock[v] = jasmine.createSpy().and
                .returnValue(Promise.resolve(getMockResponse(200, "", "")))
            
            //Act
            var promise = http[v].call(scopeMock, "http://www.baseurl/some/path", null)
            
            promise.then(function () {
                //Assert
                expect(httpClientMock[v]).toHaveBeenCalledWith("http://www.baseurl/some/path", null)
            })
            .finally(assertPromiseResolved(promise, done))})
        
        it("handles input to " + v + " with headers", function (done) {
            //Arrange
            var body = { some: "body", items: "here"}
            var headers = { "key1": "value1", "key2": "value2"}
            httpClientMock[v] = jasmine.createSpy().and
                .returnValue(Promise.resolve(getMockResponse(200, "", "")))
                        
            //Act
            var promise = http[v].call(scopeMock, "http://www.baseurl/some/path", body, headers)
            
            promise.then(function () {
                //Assert
                expect(httpClientMock[v]).toHaveBeenCalledWith("http://www.baseurl/some/path", body)
                expect(httpClientMock.addHeader).toHaveBeenCalledWith("key1", "value1")
                expect(httpClientMock.addHeader).toHaveBeenCalledWith("key2", "value2")
            })
            .finally(assertPromiseResolved(promise, done))
        })
        
        it("returns data from " + v, function (done) {
            //Arrange
            httpClientMock[v] = jasmine.createSpy().and.returnValue(Promise.resolve(getMockResponse(200, null, "body")))
            
            //Act
            var promise = http[v].call(scopeMock, "http://www.baseurl/some/path")
            
            //Assert
            promise.then(function (result) {
                expect(result.body).toBe("body")
            })
            .finally(assertPromiseResolved(promise, done))
        })
        
        it("emits event data for " + v + " calls", function (done) {
            //Arrange
            httpClientMock[v] = jasmine.createSpy().and
                .returnValue(Promise.resolve(getMockResponse(123, "status message", "body value", {
                    h1: "h1 value",
                    h2: "h2 value"
                })))
            spyOn(scopeMock, "$emit")
            var dt1 = new Date("2016-03-11 06:44:00")
            var dt2 = new Date("2016-03-11 06:45:00")
            spyOn(helperMock, "getDateTime").and.returnValues(dt1, dt2)
            spyOn(helperMock, "getUniqueId").and.returnValue("call unique id")
            
            //Act
            var promise = http[v].call(scopeMock, "http://www.baseurl/some/path", { v1: 7, v2: "test"},
            {
                h1: "header 1 val",
                h2: "header 2 val"
            })
            
            //Assert
            promise.then(function () {
                expect(scopeMock.$emit).toHaveBeenCalledWith("http.request", jasmine.objectContaining({
                    method: v,
                    url: "http://www.baseurl/some/path",
                    data: {
                        v1: 7,
                        v2: "test"
                    },
                    headers: {
                        h1: "header 1 val",
                        h2: "header 2 val"
                    },
                    requestStart: dt1,
                    id: "call unique id"
                }))
                expect(scopeMock.$emit).toHaveBeenCalledWith("http.response", jasmine.objectContaining({
                    status: 123,
                    statusMessage: "status message",
                    body: "body value",
                    headers: {
                        h1: "h1 value",
                        h2: "h2 value"
                    },
                    requestEnd: dt2,
                    requestId: "call unique id"
                }))
            })
            .finally(assertPromiseResolved(promise, done))
            
        });
        
    })
    
    function getMockResponse(status, statusMessage, body, headers) {
        return {
            statusCode: status,
            statusMessage: statusMessage,
            body: body,
            headers: headers
        }
    }

    function assertPromiseResolved(promise, doneFunc) {
        return function () {
            if (!promise.isFulfilled()) {
                console.error(promise.reason())
            }
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
})