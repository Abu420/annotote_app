import { XHRBackend, Http, RequestOptions } from "@angular/http";
import { InterceptedHttp } from "../services/InterceptedHttp";

export function HttpFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions): Http {
    return new InterceptedHttp(xhrBackend, requestOptions);
}