/**
 * Created by nomantufail on 18/05/2017.
 */
import { Injectable } from '@angular/core';
import {User} from "../models/user";
declare var io:any;
@Injectable()

export class ChatService {

  public socket:any = null;
  public threadingUser:User;
  public socketUrl:string = "http://139.162.37.73:5000";
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
}
