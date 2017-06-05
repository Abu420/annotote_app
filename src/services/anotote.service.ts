/**
 * Created by nomantufail on 18/05/2017.
 */
import { Injectable } from '@angular/core';
import { User } from "../models/user";
import { Constants } from '../services/constants.service'
import { Http, RequestOptions, Headers } from "@angular/http";

@Injectable()

export class AnototeService {

  public constructor(public http: Http, public constants: Constants) { }

  public fetchTotes(whichStream) {
    let headers = new Headers();
    headers.append('Authorization', '$2y$10$XLoU25gEWjCk/iDgJpHHcekPts9Shfn3hyJvrzOFFpY2zeg/kedeC');
    return this.http.get('http://139.162.37.73/anotote/api/totes/' + whichStream, {
      headers: headers
    });
  }

  /**
   * Fetch Latest Annotote Stream [Last 48 Hours]
   */

  public fetchLatestTotes() {
    var url = this.constants.API_BASEURL + '/totes/fetch?dateTime=1496279585&page=0';
    var response = this.http.get(url).map(res => res.json());
    return response;
  }

  public mapAnototeListing(totes: Array<any>) {
    //todo: implement real maping
    return [];
  }
}
