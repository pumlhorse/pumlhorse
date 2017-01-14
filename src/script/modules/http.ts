import { pumlhorse } from '../../PumlhorseGlobal';
import { IScope } from '../IScope';
import * as http from 'http-client-factory';
import enforce from '../../util/enforce';

const verbs = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

export class HttpRequestModule {
    static async makeRequest(verb: string, url: string, data: any, headers: Object, $scope: IScope): Promise<IHttpResponse> {
        enforce(url, 'url').isNotNull().isNotEmpty();

        var client = http.getClient();

        if (headers != null) {
            for(var x in headers) {
                client.addHeader(x, headers[x]);
            }
        }

        try {
            return await client[verb](url, data)
        }
        catch (err) {
            if (err.code === 'ENOTFOUND') {
                throw new Error(`Unable to resolve host "${err.hostname}"`)
            }
            throw err;
        }
    }

    static async get(url: string, data: any, headers: Object, $scope: IScope): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('get', url, data, headers, $scope);
    }

    static async post(url: string, data: any, headers: Object, $scope: IScope): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('post', url, data, headers, $scope);
    }

    static async put(url: string, data: any, headers: Object, $scope: IScope): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('put', url, data, headers, $scope);
    }

    static async delete(url: string, data: any, headers: Object, $scope: IScope): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('delete', url, data, headers, $scope);
    }

    static async patch(url: string, data: any, headers: Object, $scope: IScope): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('patch', url, data, headers, $scope);
    }

    static async options(url: string, data: any, headers: Object, $scope: IScope): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('options', url, data, headers, $scope);
    }

    static async head(url: string, data: any, headers: Object, $scope: IScope): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('head', url, data, headers, $scope);
    }

    static getJsonBody(response: IHttpResponse): any {
        if (!response) return undefined
        
        try {
            return JSON.parse(response.body)
        }
        catch (err) {
            return response.body
        }
    }
}

export class HttpAssertionModule
{
    static isRange(response: IHttpResponse, start: number, end: number) {
        var actual = response.statusCode
        if (actual < start || end < actual) {
            throw new Error(`Expected code between ${start} and ${end}, actual: ${actual}`)
        }
    }

    static isCode(response: IHttpResponse, code: number) {
        if (response.statusCode !== code) {
            throw new Error(`Expected status code ${code}, actual: ${response.statusCode}`)
        }
    }

    /* Ranges */
    static isInformational(response: IHttpResponse) { HttpAssertionModule.isRange(response, 100, 199); }
    static isSuccess(response: IHttpResponse) { HttpAssertionModule.isRange(response, 200, 299); }
    static isRedirect(response: IHttpResponse) { HttpAssertionModule.isRange(response, 300, 399); }
    static isError(response: IHttpResponse) { HttpAssertionModule.isRange(response, 400, 599); }
    /* Specific error codes */
    static isOk(response: IHttpResponse) { HttpAssertionModule.isCode(response, 200); }
    static isNotModified(response: IHttpResponse) { HttpAssertionModule.isCode(response, 304); }
    static isBadRequest(response: IHttpResponse) { HttpAssertionModule.isCode(response, 400); }
    static isUnauthorized(response: IHttpResponse) { HttpAssertionModule.isCode(response, 401); }
    static isForbidden(response: IHttpResponse) { HttpAssertionModule.isCode(response, 403); }
    static isNotFound(response: IHttpResponse) { HttpAssertionModule.isCode(response, 404); }
    static isNotAllowed(response: IHttpResponse) { HttpAssertionModule.isCode(response, 405); }
}

export interface IHttpResponse {
    headers: Object;
    statusCode: number;
    statusMessage: string;
    body: any;
}

pumlhorse.module('http')
    .function('get', ['url', 'data', 'headers', '$scope', HttpRequestModule.get])
    .function('post', ['url', 'data', 'headers', '$scope', HttpRequestModule.post])
    .function('put', ['url', 'data', 'headers', '$scope', HttpRequestModule.put])
    .function('delete', ['url', 'data', 'headers', '$scope', HttpRequestModule.delete])
    .function('patch', ['url', 'data', 'headers', '$scope', HttpRequestModule.patch])
    .function('options', ['url', 'data', 'headers', '$scope', HttpRequestModule.options])
    .function('head', ['url', 'data', 'headers', '$scope', HttpRequestModule.head])
    //Assertions
    .function('isInformational', HttpAssertionModule.isInformational)
    .function('isSuccess', HttpAssertionModule.isSuccess)
    .function('isRedirect', HttpAssertionModule.isRedirect)
    .function('isError', HttpAssertionModule.isError)
    .function('isOk', HttpAssertionModule.isOk)
    .function('isNotModified', HttpAssertionModule.isNotModified)
    .function('isBadRequest', HttpAssertionModule.isBadRequest)
    .function('isUnauthorized', HttpAssertionModule.isUnauthorized)
    .function('isForbidden', HttpAssertionModule.isForbidden)
    .function('isNotFound', HttpAssertionModule.isNotFound)
    .function('isNotAllowed', HttpAssertionModule.isNotAllowed)
    //Serialization
    .function('body', HttpRequestModule.getJsonBody);