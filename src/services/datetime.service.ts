/**
 * Created by nomantufail on 18/05/2017.
 */
import { Injectable } from '@angular/core';
import { User } from "../models/user";
import { Constants } from '../services/constants.service'
import { Http, RequestOptions, Headers } from "@angular/http";

@Injectable()
export class DatetimeService {
  public constructor() { }

  /**
   * convert unix timestamp to readable format
   */
  convertTimeFormat(time:string){
    return '05:00 PM'
  }
}
