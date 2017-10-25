/**
 * Created by nomantufail on 18/05/2017.
 */
import { Injectable } from '@angular/core';
import { User } from "../models/user";
import { Http, RequestOptions, Headers } from "@angular/http";
import { AuthenticationService } from "./auth.service";
import { Constants } from '../services/constants.service';
declare var io: any;
@Injectable()

export class ChatService {

  public socket: any = null;
  public threadingUser: User;
  public socketUrl: string = "http://139.162.37.73:5000";
  constructor(public http: Http, public authService: AuthenticationService, public constants: Constants) {

  }
  public listenForGlobalMessages() {
    this.socket = io(this.socketUrl);
    this.socket.on('receive_message', (msg: any) => {
      if (msg.receiverId == this.authService.getUser().id) {
        //console.log('listening for global messages');
      }
    });
  }

  public getLoggedInUserId() {
    return 2;
  }

  public fetchHistory(firstUser: number, secondUser: number, page = 1, anotote_id) {
    if (anotote_id == 0)
      var url = this.constants.API_BASEURL + '/chat-history?second_person=' + secondUser + '&page=' + page;
    else
      var url = this.constants.API_BASEURL + '/chat-history?second_person=' + secondUser + '&anotote_id=' + anotote_id + '&page=' + page;
    var response = this.http.get(url).map(res => res.json())
    return response;
  }

  public saveMessage(params: any) {
    return this.http.post(this.constants.API_BASEURL + "/send-message", params, {}).map(res => res.json());
  }
  public updateMessage(params: any) {
    return this.http.post(this.constants.API_BASEURL + "/update-message", params, {}).map(res => res.json());
  }

  public deleteMessage(params: any) {
    return this.http.get(this.constants.API_BASEURL + "/delete-message?message_id=" + params.id).map(res => res.json());
  }


  // public currentUnixTimestamp() {
  //   return Math.round((new Date()).getTime() / 1000);
  // }

  public checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }



  public currentTime() {
    let today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    // add a zero in front of numbers<10
    m = this.checkTime(m);
    s = this.checkTime(s);
    return h + ":" + m + ":" + s;
  }
}
