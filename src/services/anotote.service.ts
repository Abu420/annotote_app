/**
 * Created by nomantufail on 18/05/2017.
 */
import { Injectable } from '@angular/core';
import {User} from "../models/user";
import {Http, RequestOptions, Headers} from "@angular/http";

@Injectable()

export class AnototeService {

  public constructor(public http:Http){}

  public fetchTotes(){
    return this.http.get('http://139.162.37.73/anotote/api/totes/me');
  }

  public mapAnototeListing(totes:Array<any>){
    //todo: implement real maping
    return [];
  }
}
