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
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization':'$2y$10$35FPtXCqaC9bgABVrQ7hle342ZOO274mogDgE8/pqixKhRVaPPGG6' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post("http://139.162.37.73/anotote/api/send-message",data, options);
  }
}
