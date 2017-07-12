import { Injectable } from "@angular/core";
import { ConnectionBackend, RequestOptions, Request, RequestOptionsArgs, Response, Http, Headers } from "@angular/http";
import { Observable } from "rxjs/Rx";
import { Inject } from '@angular/core';
import { UtilityMethods } from "./utility_methods";

@Injectable()
export class InterceptedHttp extends Http {
    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions, public utils: UtilityMethods) {
        super(backend, defaultOptions);
    }

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        if (!this.utils.isOffline())
            return super.request(url, options)
                .timeout(60000).catch(err => {
                    if (err.name !== "TimeoutError") {
                        return Observable.throw({ "error": "Timeout has occurred", "code": -2 });
                    }
                    return Observable.throw(err);
                });
        else {
            return Observable.throw({ "error": 'no_internet_connection', "code": -1 });
        }
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.get(url, this.getRequestOptionArgs(options));
    }

    post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.post(url, body, this.getRequestOptionArgs(options));
    }

    put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.put(url, body, this.getRequestOptionArgs(options));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.delete(url, this.getRequestOptionArgs(options));
    }

    private getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
        }
        options.headers.append('Content-Type', 'application/json');
        var _token = localStorage.getItem('_token');
        if (_token)
            options.headers.set('Authorization', _token);

        options.headers.set("Cache-Control", "no-cache");
        // options.headers.set("Pragma", "no-cache");
        return options;
    }
}