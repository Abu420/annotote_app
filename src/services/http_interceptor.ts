import { Injectable } from '@angular/core';
import { Http, ConnectionBackend, Headers, RequestOptions, BaseRequestOptions, Request, Response, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Network } from '@ionic-native/network';

@Injectable()
export class DefaultRequestOptions extends BaseRequestOptions {
    headers = new Headers();

    constructor(private network: Network) {
        super();
    }

    merge(options?: RequestOptionsArgs): RequestOptions {
        var newOptions = super.merge(options),
            _token = localStorage.getItem('_token');
        // if (_token)
        //     newOptions.headers.set('Authorization', _token);
        return newOptions;
    }
}