/**
 * Created by nomantufail on 18/05/2017.
 */
import { Injectable } from '@angular/core';
import {User} from "../models/user";
import {Http, RequestOptions, Headers} from "@angular/http";
declare var io:any;
@Injectable()

export class ChatService {

  public socket:any = null;
  public threadingUser:User;
  public socketUrl:string = "http://139.162.37.73:5000";
  constructor(public http:Http){

  }
  public listenForGlobalMessages(){
    this.socket = io(this.socketUrl);
    this.socket.on('receive_message', (msg:any)=>{
      if(msg.receiverId == this.getLoggedInUserId()){
        console.log('listening for global messages');
      }
    });
  }

  public getLoggedInUserId(){
    return 2;
  }

  public fetchHistory(firstUser:number, secondUser:number){
    return this.http.get('http://139.162.37.73/anotote/api/fetch-chat-history?second_person='+secondUser);
  }

  public saveMessage(data:any){
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'$2y$10$m2fnGSYO8Aq4vPgI3uID9egtVStelES9lFIVswpdc38P6n7wHoRvm' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post("http://139.162.37.73/anotote/api/send-message",data, options);
  }

  public currentUnixTimestamp(){
    return Math.round((new Date()).getTime() / 1000);
  }

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
