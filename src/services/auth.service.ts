/**
 * Created by Bilal Akmal on 02/06/2017.
 */
import { Injectable } from '@angular/core';
import { User } from "../models/user";
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { Constants } from '../services/constants.service'
import { Http, RequestOptions, Headers } from "@angular/http";

@Injectable()

export class AuthenticationService {

  /**
   * Variables
   */
  private _user: User;
  private _storage_ready: boolean;

  public constructor(public http: Http, public constants: Constants, public storage: Storage) {
    this.storage.ready().then(() => {
      this._storage_ready = true;
    });
  }

  /**
   * Set User to Native Storage
   */
  public setUser(user: User) {
    if (this._storage_ready)
      this.storage.set('_user', user);
    this._user = user;
  }

  /**
   * Get User from Native Storage
   */
  public getUser() {
    return this._user;
  }

  /**
   * Clear User from storage and memory
   */
  public clear_user() {
    this._user = null;
    this.storage.clear();
  }

  /**
   * Sync User from native storage to local memory
   */
  public sync_user() {
    var response = this.storage.get('_user').then((value) => {
      console.log(value)
      this._user = value;
      return value;
    });
    return response;
  }

  /**
     * Register API
     * type: {POST}
     * params: [email, password, device_type], 
     */
  public register(params) {
    var url = this.constants.API_BASEURL + '/register';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }

  /**
   * Login API
   * type: {POST}
   * params: [email, password, device_type], 
   */
  public login(params) {
    var url = this.constants.API_BASEURL + '/login';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }

  /**
   * Logout API
   * type: {POST}
   * params: [], 
   */
  public logout() {
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': this._user.access_token });
    var options = new RequestOptions({ headers: headers }),
      url = this.constants.API_BASEURL + '/logout';
    var response = this.http.get(url, options).map(res => res.json());
    return response;
  }

  /**
   * Forgot Password API
   * type: {POST}
   * params: [email], 
   */
  public forgot_password(params) {
    var url = this.constants.API_BASEURL + '/forgot-password';
    var response = this.http.post(url, params, {}).map(res => res.json());
    return response;
  }
}
