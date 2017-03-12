import { HttpAssertionModule, HttpRequestModule, IHttpResponse } from '../../../src/script/modules/http';
import * as Proxyquire from 'proxyquire';

describe('HTTP functions', () => {
    var verbs = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

    var httpClientMock;
    var httpClientFactoryMock = { getClient: () => httpClientMock };

    var http;

    beforeEach(() => {
        httpClientMock = jasmine.createSpyObj('httpMock', verbs);
        httpClientMock.addHeader = jasmine.createSpy('addHeader');

        http = Proxyquire('../../../src/script/modules/http', {
            'http-client-factory': httpClientFactoryMock,
            '@noCallThru': true
        });
    });

    verbs.forEach(verb => {
        it(`throws exception if ${verb} URL is missing`, testAsync(async () => {
            // Arrange
            
            try {
                // Act
                await http.HttpRequestModule[verb]();
                fail();
            }
            catch (error) {
                // Assert
                expect(error.message).toBe('Parameter "url" is required');
            }
        }));
        
        it(`throws exception if ${verb} URL is null`, testAsync(async () => {
            // Arrange
            
            try {
                // Act
                await http.HttpRequestModule[verb](null);
                fail();
            }
            catch (error) {
                // Assert
                expect(error.message).toBe('Parameter "url" cannot be null');
            }
        }));
        
        it(`throws exception if ${verb} URL is empty`, testAsync(async () => {
            // Arrange
            
            try {
                // Act
                await http.HttpRequestModule[verb]('');
                fail();
            }
            catch (error) {
                // Assert
                expect(error.message).toBe('Parameter "url" cannot be empty');
            }
        }));
        
        it('catches network error and returns a better message', testAsync(async () => {
            //Arrange
            httpClientMock[verb].and
                .returnValue(Promise.reject({
                    code: 'ENOTFOUND',
                    hostname: 'invalid host name'
                }));
            
            try {
                //Act
                await http.HttpRequestModule[verb]('http://www.baseurl/some/path');
                fail();
            }
            catch (err) {
                //Assert
                expect(err.message).toBe('Unable to resolve host "invalid host name"');
            }            
        }));

        it(`handles input to ${verb}`, testAsync(async () => {
            //Arrange
            var body = { some: 'body', items: 'here'}
            httpClientMock[verb].and
                .returnValue(Promise.resolve(getMockResponse(200, '', '', null)))
            
            //Act
            var result = await http.HttpRequestModule[verb]('http://www.baseurl/some/path', body);
            
            //Assert
            expect(httpClientMock[verb]).toHaveBeenCalledWith('http://www.baseurl/some/path', body);
        }));
        
        it(`handles input to ${verb} with null body`, testAsync(async () => {
            //Arrange
            httpClientMock[verb].and
                .returnValue(Promise.resolve(getMockResponse(200, '', '', null)))
            
            //Act
            var result = await http.HttpRequestModule[verb]('http://www.baseurl/some/path', null);
            
            //Assert
            expect(httpClientMock[verb]).toHaveBeenCalledWith('http://www.baseurl/some/path', null);
        }));
        
        it(`handles input to ${verb} with headers`, testAsync(async () => {
            //Arrange
            var body = { some: 'body', items: 'here'}
            var headers = { 'key1': 'value1', 'key2': 'value2'}
            httpClientMock[verb].and
                .returnValue(Promise.resolve(getMockResponse(200, '', '', null)))
            
            //Act
            var result = await http.HttpRequestModule[verb]('http://www.baseurl/some/path', body, headers);
            
            //Assert
            expect(httpClientMock[verb]).toHaveBeenCalledWith('http://www.baseurl/some/path', body);
            expect(httpClientMock.addHeader).toHaveBeenCalledWith('key1', 'value1')
            expect(httpClientMock.addHeader).toHaveBeenCalledWith('key2', 'value2')
        })); 
        
        it(`returns data from ${verb}`, testAsync(async () => {
            //Arrange
            httpClientMock[verb].and
                .returnValue(Promise.resolve(getMockResponse(200, '', 'body', null)))
            
            //Act
            var result = await http.HttpRequestModule[verb]('http://www.baseurl/some/path');
            
            //Assert
            expect(result.statusCode).toBe(200);
            expect(result.body).toBe('body');
        }));       
        
    });
    
    function testAsync(runAsync) {
        return (done) => {
            runAsync().then(done, e => { fail(e); done(); });
        };
    }
    
    function getMockResponse(status: number, statusMessage: string, body: any, headers: Object): IHttpResponse {
        return {
            statusCode: status,
            statusMessage: statusMessage,
            body: body,
            headers: headers
        }
    }
});

describe('HTTP assertions', function () {
        
    var ranges = [
        {
            name: 'isInformational',
            start: 100,
            end: 199,
            success: [100, 101, 105, 199],
            error: [99, 201, 211, 1000, 305, 1]
        },
        {
            name: 'isSuccess',
            start: 200,
            end: 299,
            success: [200, 201, 205, 299],
            error: [100, 199, 2, 2000, 300]
        },
        {
            name: 'isRedirect',
            start: 300,
            end: 399,
            success: [300, 301, 305, 399],
            error: [200, 299, 3, 3000, 400]
        },
        {
            name: 'isError',
            start: 400,
            end: 599,
            success: [400, 401, 499, 500, 501, 599],
            error: [300, 399, 4, 5, 4000, 5000, 600]
        },
        {
            name: 'isClientError',
            start: 400,
            end: 499,
            success: [400, 401, 499],
            error: [300, 399, 4, 5, 500, 501, 599, 4000, 5000, 600]
        },
        {
            name: 'isServerError',
            start: 500,
            end: 599,
            success: [500, 501, 599],
            error: [300, 399, 4, 5, 400, 401, 499, 4000, 5000, 600]
        }
    ];
    
    ranges.forEach(function (range) {
        range.success.forEach(function (code) {
            it(`passes ${code} for ${range.name} range`, function () {
                //Arrange
                
                //Act
                HttpAssertionModule[range.name]({ statusCode: code });
                
                //Assert
            });
        })
        
        range.error.forEach(function (code) {
            it(`fails ${code} for ${range.name} range`, function () {
                //Arrange
                
                //Act
                try {
                    HttpAssertionModule[range.name]({ statusCode: code })
                    fail()
                }
                catch (err) {
                    //Assert
                    expect(err.message)
                        .toBe(`Expected code between ${range.start} and ${range.end}, actual: ${code}`)
                }
            });
        })
        
    })
    
    var codes = [
        {
            name: 'isOk',
            code: 200                
        },
        {
            name: 'isCreated',
            code: 201                
        },
        {
            name: 'isAccepted',
            code: 202                
        },
        {
            name: 'isNoContent',
            code: 204               
        },
        {
            name: 'isNotModified',
            code: 304                
        },
        {
            name: 'isBadRequest',
            code: 400                
        },
        {
            name: 'isUnauthorized',
            code: 401                
        },
        {
            name: 'isForbidden',
            code: 403                
        },
        {
            name: 'isNotFound',
            code: 404                
        },
        {
            name: 'isNotAllowed',
            code: 405                
        }
    ]
    
    codes.forEach(function (code) {
        it(`passes ${code.code} for ${code.name}`, function () {
            HttpAssertionModule[code.name]({statusCode: code.code});
        });
        
        it(`fails for non-${code.code} for ${code.name}`, function () {
            //Arrange
            var badCode = code.code - 1
            
            //Act
            try {
                HttpAssertionModule[code.name]({statusCode: badCode });
                fail();
            }
            catch (err) {
                //Assert
                expect(err.message).toBe(`Expected status code ${code.code}, actual: ${badCode}`);
            }
        });
    });

    it('will dump information on a response', () => {
        // Arrange
        var response: IHttpResponse = {
            headers: {
                'header1': 'header 1 value',
                'header2': 'header 2 value'                
            },
            statusCode: 123,
            statusMessage: 'status message',
            body: 'some BODY'
        };
        var scopeMock = jasmine.createSpyObj('scope', ['log']);
        
        // Act
        HttpRequestModule.dumpResponse(response, scopeMock);
        
        // Assert
        expect(scopeMock.log).toHaveBeenCalledWith('Response: 123 - status message');
        expect(scopeMock.log).toHaveBeenCalledWith('---Headers---');
        expect(scopeMock.log).toHaveBeenCalledWith('"header1": "header 1 value"');
        expect(scopeMock.log).toHaveBeenCalledWith('"header2": "header 2 value"');
        expect(scopeMock.log).toHaveBeenCalledWith('---Body---');
        expect(scopeMock.log).toHaveBeenCalledWith('some BODY');
    });
       
});