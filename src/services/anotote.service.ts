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
  private BROWSER_PAGES: any = [];
  public currentPage: number = 0;

  public constructor(public http: Http, public constants: Constants, public authService: AuthenticationService) {

  }

  public fetchTotes(whichStream, page = 1) {
    var url = this.constants.API_BASEURL + '/totes/' + whichStream + '?page=' + page
    var response = this.http.get(url).map(res => res.json())
    return response;

  }
  public fetchUserTotes(userId, page = 1) {
    var url = this.constants.API_BASEURL + '/totes/user' + '?page=' + page + '&&user_id=' + userId;
    var response = this.http.get(url).map(res => res.json())
    return response;
  }

  public fetchMentionedTote(url) {
    var response = this.http.get(url).map(res => res.json())
    return response;
  }

  public saveTitle(params) {
    var url = this.constants.API_BASEURL + '/update-annotote-title';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }

  public fetchLatestTotes(page, current_time) {
    var url = this.constants.API_BASEURL + '/totes/fetch?dateTime=' + current_time + '&page=' + page;
    var response = this.http.get(url, {}).map(res => res.json());
    return response;
  }


  public fetchToteDetails(params) {
    var url = this.constants.API_BASEURL + '/get-annotote-detail?user_id=' + params.user_id + '&user_annotote_id=' + params.anotote_id + '&time=' + params.time;
    var response = this.http.get(url).map(res => res.json())
    return response;
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
      if (this.BROWSER_PAGES[i].url == item.url) {
        return;
      }
    }
    this.BROWSER_PAGES.push(item);
  }

  public get_saved_pages_locally() {
    return this.BROWSER_PAGES;
  }

  public clearSavedPages() {
    this.BROWSER_PAGES = [];
  }
  public delete_bulk_totes(params) {
    var url = this.constants.API_BASEURL + '/delete-bulk-annototes';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }
  public delete_chat_tote(params) {
    var url = this.constants.API_BASEURL + '/delete-chat-tote?group_id=' + params.group_id;
    var response = this.http.get(url).map(res => res.json());
    return response;
  }
  public privatize_bulk_totes(params) {
    var url = this.constants.API_BASEURL + '/privacy-bulk-annototes';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }
  public chat_tote_privacy(params) {
    var url = this.constants.API_BASEURL + '/update-chat-tote';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }
  public save_totes(params) {
    var url = this.constants.API_BASEURL + '/save-annotote';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }
  public bookmark_totes(params) {
    var url = this.constants.API_BASEURL + '/bookmark-annotote';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }
  public top_totes(params) {
    var url = this.constants.API_BASEURL + '/totes/top?time=' + params.time + '&page=' + params.number;
    var response = this.http.get(url).map(res => res.json());
    return response;
  }
  public update_annotation(params) {
    var url = this.constants.API_BASEURL + '/annotote/highlight/update';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }
  public delete_annotation(params) {
    var url = this.constants.API_BASEURL + '/delete-user-annotation';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }
  public vote_anotote(params) {
    var url = this.constants.API_BASEURL + '/annotote/vote';
    var response = this.http.post(url, params).map(res => res.json());
    return response;
  }
  public vote_chat_tote(params) {
    var url = this.constants.API_BASEURL + '/chat/vote';
    var response = this.http.post(url, params).map(res => res.json());
    return response;
  }

  public deleteVote(params) {
    var url = this.constants.API_BASEURL + '/delete-annotote-vote';
    var response = this.http.post(url, params).map(res => res.json());
    return response;
  }

  public deleteChatVote(params) {
    var url = this.constants.API_BASEURL + '/delete-chat-vote';
    var response = this.http.post(url, params).map(res => res.json());
    return response;
  }
}
