/**
 * Created by nomantufail on 18/05/2017.
 */
import { Injectable } from '@angular/core';
import {User} from "../models/user";

@Injectable()

export class ChatService {

  public socket:any = null;
  public threadingUser:User;

}
