/**
 * Created by nomantufail on 18/05/2017.
 */
import { Injectable } from '@angular/core';
import {User} from "../models/user";
import {Http, RequestOptions, Headers} from "@angular/http";

@Injectable()

export class AnototeService {

  public constructor(public http:Http){}

  public fetchTotes(whichStream){
    let headers = new Headers();
    headers.append('Authorization', '$2y$10$XLoU25gEWjCk/iDgJpHHcekPts9Shfn3hyJvrzOFFpY2zeg/kedeC');
    return this.http.get('http://139.162.37.73/anotote/api/totes/'+whichStream,{
      headers: headers
    });
  }

  public mapAnototeListing(totes:Array<any>){
    //todo: implement real maping
    return [];
  }
}
