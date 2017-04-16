import { ILogger } from '../loggers';
import * as _ from 'underscore';
import * as http from 'http-client-factory';
import { CancellationToken, ICancellationToken } from '../../util/CancellationToken';
import { pumlhorse } from '../../PumlhorseGlobal';
import { IScope } from '../Scope';
import enforce from '../../util/enforce';

export class HttpRequestModule {
    static async makeRequest(verb: string, url: string, data: any, headers: Object, $cancellationToken: ICancellationToken, $httpDefaultHeaders: Object): Promise<IHttpResponse> {        
        enforce(url, 'url').isNotNull().isNotEmpty();

        const client = http.getClient();

        client.addHeader('User-Agent', 'Pumlhorse HTTP Client');

        _.forEach(_.extend($httpDefaultHeaders, headers), (val, key) => {
            client.addHeader(key, val);
        });

        try {
            const response = await CancellationToken.await<IHttpResponse>(client[verb](url, data), $cancellationToken);
            HttpRequestModule.handleResponse(response);
            return response;
        }
        catch (err) {
            if (err.code === 'ENOTFOUND') {
                throw new Error(`Unable to resolve host "${err.hostname}"`)
            }
            throw err;
        }
    }

    private static jsonRegex = /(application|text)\/json/gi;
    static handleResponse(response: IHttpResponse) {
        if (response.headers != null &&
            response.headers['content-type'] != null &&
            response.headers['content-type'].search(HttpRequestModule.jsonRegex) > -1) {
            response.json = HttpRequestModule.getJsonBody(response);        
        }
    }

    static async get(url: string, data: any, headers: Object, $cancellationToken: ICancellationToken, $httpDefaultHeaders: Object): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('get', url, data, headers, $cancellationToken, $httpDefaultHeaders);
    }

    static async post(url: string, data: any, headers: Object, $cancellationToken: ICancellationToken, $httpDefaultHeaders: Object): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('post', url, data, headers, $cancellationToken, $httpDefaultHeaders);
    }

    static async put(url: string, data: any, headers: Object, $cancellationToken: ICancellationToken, $httpDefaultHeaders: Object): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('put', url, data, headers, $cancellationToken, $httpDefaultHeaders);
    }

    static async delete(url: string, data: any, headers: Object, $cancellationToken: ICancellationToken, $httpDefaultHeaders: Object): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('delete', url, data, headers, $cancellationToken, $httpDefaultHeaders);
    }

    static async patch(url: string, data: any, headers: Object, $cancellationToken: ICancellationToken, $httpDefaultHeaders: Object): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('patch', url, data, headers, $cancellationToken, $httpDefaultHeaders);
    }

    static async options(url: string, data: any, headers: Object, $cancellationToken: ICancellationToken, $httpDefaultHeaders: Object): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('options', url, data, headers, $cancellationToken, $httpDefaultHeaders);
    }

    static async head(url: string, data: any, headers: Object, $cancellationToken: ICancellationToken, $httpDefaultHeaders: Object): Promise<IHttpResponse> {
        return await HttpRequestModule.makeRequest('head', url, data, headers, $cancellationToken, $httpDefaultHeaders);
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

    static dumpResponse(response: IHttpResponse, $logger: ILogger) {
        $logger.log(`Response: ${response.statusCode} - ${response.statusMessage}`);
        $logger.log('---Headers---');
        for (let x in response.headers)
        {
            $logger.log(`"${x}": "${response.headers[x]}"`);
        }
        if (response.body != null) {
            $logger.log('---Body---');
            $logger.log(response.body);
        }
    }

    static setDefaultHeaders($all: Object, $httpDefaultHeaders: Object) {
        _.extendOwn($httpDefaultHeaders, $all);
    }

    static setAuthorization(val: string, $httpDefaultHeaders: Object) {
       HttpRequestModule.setDefaultHeaders({ Authorization: val}, $httpDefaultHeaders);
    }

    static setBasicAuthorization(username: string, password: string, $httpDefaultHeaders: Object) {
        enforce(username).isNotNull().isString();
        enforce(password).isNotNull().isString();

        const encoded = new Buffer(`${username}:${password}`, 'utf8').toString('base64');
        HttpRequestModule.setAuthorization(`Basic ${encoded}`, $httpDefaultHeaders);
    }

    private static _headersKey = '__httpDefaultHeaders';
    static getDefaultHeaders($scope: IScope) {
        let scopeHeaders = $scope[HttpRequestModule._headersKey];
        if (scopeHeaders == null) {
            $scope[HttpRequestModule._headersKey] = scopeHeaders = {}
        }

        return scopeHeaders;
    }
}

export class HttpAssertionModule
{
    static isRange(response: IHttpResponse, start: number, end: number) {
        const actual = response.statusCode
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
    static isClientError(response: IHttpResponse) { HttpAssertionModule.isRange(response, 400, 499); }
    static isServerError(response: IHttpResponse) { HttpAssertionModule.isRange(response, 500, 599); }
    /* Specific error codes */
    static isOk(response: IHttpResponse) { HttpAssertionModule.isCode(response, 200); }
    static isCreated(response: IHttpResponse) { HttpAssertionModule.isCode(response, 201); }
    static isAccepted(response: IHttpResponse) { HttpAssertionModule.isCode(response, 202); }
    static isNoContent(response: IHttpResponse) { HttpAssertionModule.isCode(response, 204); }

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
    json?: any; //Populated if content type is json
}

pumlhorse.module('http')
    .function('get', ['url', 'data', 'headers', '$cancellationToken', '$httpDefaultHeaders', HttpRequestModule.get])
    .function('post', ['url', 'data', 'headers', '$cancellationToken', '$httpDefaultHeaders', HttpRequestModule.post])
    .function('put', ['url', 'data', 'headers', '$cancellationToken', '$httpDefaultHeaders', HttpRequestModule.put])
    .function('delete', ['url', 'data', 'headers', '$cancellationToken', '$httpDefaultHeaders', HttpRequestModule.delete])
    .function('patch', ['url', 'data', 'headers', '$cancellationToken', '$httpDefaultHeaders', HttpRequestModule.patch])
    .function('options', ['url', 'data', 'headers', '$cancellationToken', '$httpDefaultHeaders', HttpRequestModule.options])
    .function('head', ['url', 'data', 'headers', '$cancellationToken', '$httpDefaultHeaders', HttpRequestModule.head])
    .function('setDefaultHeaders', HttpRequestModule.setDefaultHeaders)
    .function('setAuthorization', HttpRequestModule.setAuthorization)
    .function('setBasicAuthorization', HttpRequestModule.setBasicAuthorization)
    .injector('$httpDefaultHeaders', HttpRequestModule.getDefaultHeaders)
    //Assertions
    .function('isInformational', HttpAssertionModule.isInformational)
    .function('isSuccess', HttpAssertionModule.isSuccess)
    .function('isRedirect', HttpAssertionModule.isRedirect)
    .function('isError', HttpAssertionModule.isError)
    .function('isClientError', HttpAssertionModule.isClientError)
    .function('isServerError', HttpAssertionModule.isServerError)
    .function('isOk', HttpAssertionModule.isOk)
    .function('isCreated', HttpAssertionModule.isCreated)
    .function('isAccepted', HttpAssertionModule.isAccepted)
    .function('isNoContent', HttpAssertionModule.isNoContent)
    .function('isNotModified', HttpAssertionModule.isNotModified)
    .function('isBadRequest', HttpAssertionModule.isBadRequest)
    .function('isUnauthorized', HttpAssertionModule.isUnauthorized)
    .function('isForbidden', HttpAssertionModule.isForbidden)
    .function('isNotFound', HttpAssertionModule.isNotFound)
    .function('isNotAllowed', HttpAssertionModule.isNotAllowed)
    //Serialization
    .function('body', HttpRequestModule.getJsonBody)
    //Debugging
    .function('dump', HttpRequestModule.dumpResponse);