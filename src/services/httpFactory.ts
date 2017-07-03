import { XHRBackend, Http, RequestOptions } from "@angular/http";
import { InterceptedHttp } from "../services/InterceptedHttp";
import { UtilityMethods } from "./utility_methods";

export function HttpFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions, Utils:UtilityMethods): Http {
    return new InterceptedHttp(xhrBackend, requestOptions,Utils);
}