/**
 * Created by nomantufail on 18/05/2017.
 */
import { Injectable } from '@angular/core';
import { User } from "../models/user";
import { Constants } from '../services/constants.service';
import { Http, RequestOptions, Headers } from "@angular/http";
import {AuthenticationService} from "./auth.service";

@Injectable()

export class AnototeService {

  public constructor(public http: Http, public constants: Constants, public authService:AuthenticationService) { }

  public fetchTotes(whichStream, page = 1) {
    let headers = new Headers();
    headers.append('Authorization', this.authService.getUser().access_token);
    return this.http.get('http://139.162.37.73/anotote/api/totes/' + whichStream+'?page='+page, {
      headers: headers
    });
  }

  public fetchLatestTotes() {
    var url = this.constants.API_BASEURL + '/totes/fetch?dateTime=1496279585&page=0';
    var response = this.http.get(url, {}).map(res => res.json());
    return response;
  }


  public fetchToteDetails(user_id: number, anotote_id: number) {
    let headers = new Headers();
    headers.append('Authorization', this.authService.getUser().access_token);
    return this.http.get('http://139.162.37.73/anotote/api/get-annotote-detail?user_id=' + user_id + '&annotote_id=' + anotote_id, {
      headers: headers
    });
  }

  public mapAnototeListing(totes: Array<any>) {
    //todo: implement real maping
    return [];
  }

  public quickChat(id){
    var url = this.constants.API_BASEURL + '/chat-quick-detail?second_person='+id;
    var response = this.http.get(url).map(res => res.json())
    return response;
  }
}
