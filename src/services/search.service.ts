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

export class SearchService {

    /**
     * Variables
     */
    private _user: User;

    public constructor(public http: Http, public constants: Constants, public storage: Storage) {
    }

    /**
     * Get User Profile API
     * type: {GET}
     * params: [user_id], 
     */
    public get_user_profile_info(user_id) {
        var url = this.constants.API_BASEURL + '/get-profile?user_id=' + user_id;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    /**
     * Follow a User API
     * type: {POST}
     * params: [term], 
     */
    public follow_user(params) {
        var url = this.constants.API_BASEURL + '/follow-user';
        var response = this.http.post(url, params, {}).map(res => res.json());
        return response;
    }

    /**
     * UnFollow a User API
     * type: {POST}
     * params: [follower_id], 
     */
    public un_follow_user(params) {
        var url = this.constants.API_BASEURL + '/unfollow-user';
        var response = this.http.post(url, params, {}).map(res => res.json());
        return response;
    }

    /**
     * Search API
     * type: {GET}
     * params: [term], 
     */
    public general_search(term) {
        var url = this.constants.API_BASEURL + '/search?term=' + term;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    /**
     * Create Anotote API
     * type: {POST}
     * params: [url, created_at], 
     */
    public create_anotote(params) {
        var url = this.constants.API_BASEURL + '/create-annotote';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
     * Save search entry
     * type: {POST}
     * params: [searched_term, book_marked, created_at]
     */
    public save_search_entry(params) {
        var url = this.constants.API_BASEURL + '/search/save';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
     * Get search entries
     * type: {GET}
     * params: [searched_term, book_marked, created_at]
     */
    public get_search_entries() {
        var url = this.constants.API_BASEURL + '/search/get';
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    /**
     * Remove search entry
     * type: {GET}
     * params: [search_id]
     */
    public remove_search_id(search_id) {
        var url = this.constants.API_BASEURL + '/search/delete?search_id=' + search_id;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    /**
    * Create Anotation on Anotote API
    * type: {POST}
    * params: [url, created_at]
    */
    public create_anotation(params) {
        var url = this.constants.API_BASEURL + '/annotote/highlight/create';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
    * Remove Anotation API
    * type: {POST}
    * params: [annotation_id, delete]
    */
    public remove_anotation(params) {
        var url = this.constants.API_BASEURL + '/delete-user-annotation';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
     * Get Anotote Content API
     * type: {GET}
     * params: [url], 
     */
    public get_anotote_content(url) {
        var response = this.http.get(url);
        return response;
    }
}
