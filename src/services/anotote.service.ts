/**
 * Created by nomantufail on 18/05/2017.
 */
import { Injectable } from '@angular/core';
import { User } from "../models/user";
import { Constants } from '../services/constants.service';
import { Http, RequestOptions, Headers } from "@angular/http";
import { AuthenticationService } from "./auth.service";

@Injectable()

export class AnototeService {
  private BROWSER_PAGES: any;

  public constructor(public http: Http, public constants: Constants, public authService: AuthenticationService) {
    this.BROWSER_PAGES = [];
  }

  public fetchTotes(whichStream, page = 1) {
    let headers = new Headers();
    headers.append('Authorization', this.authService.getUser().access_token);
    return this.http.get('http://139.162.37.73/anotote/api/totes/' + whichStream + '?page=' + page, {
      headers: headers
    });
  }

  public fetchLatestTotes(page, current_time) {
    var url = this.constants.API_BASEURL + '/totes/fetch?dateTime=' + current_time + '&page=' + page;
    var response = this.http.get(url, {}).map(res => res.json());
    return response;
  }


  public fetchToteDetails(user_id: number, anotote_id: number) {
    return this.http.get(this.constants.API_BASEURL + '/get-annotote-detail?user_id=' + user_id + '&user_annotote_id=' + anotote_id)
  }

  public mapAnototeListing(totes: Array<any>) {
    //todo: implement real maping
    return [];
  }

  public quickChat(id) {
    var url = this.constants.API_BASEURL + '/chat-quick-detail?second_person=' + id;
    var response = this.http.get(url).map(res => res.json())
    return response;
  }

  /**
   * Anotote Editor BROWSED Pages
   */
  public add_page_locally(item) {
    for (let i = 0; i < this.BROWSER_PAGES.length; i++) {
      if (this.BROWSER_PAGES[i].ANOTOTE.userAnnotote.id == item.ANOTOTE.userAnnotote.id) {
        this.BROWSER_PAGES.splice(i, 1);
        break;
      }
    }
    this.BROWSER_PAGES.push(item);
  }

  public get_saved_pages_locally() {
    return this.BROWSER_PAGES;
  }
}
