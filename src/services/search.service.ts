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
    public saved_searches = [];

    public constructor(public http: Http, public constants: Constants, public storage: Storage) {
    }

    /**
     * AlreadySavedSearches
     */
    public AlreadySavedSearches(term) {
        for (let searches of this.saved_searches)
            if (searches.term == term)
                return false;

        return true;
    }

    public getAlreadySavedSearches(term) {
        for (let searches of this.saved_searches)
            if (searches.term == term)
                return searches;

        return null;
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
    public general_search(params) {
        var url = this.constants.API_BASEURL + '/search?term=' + params.term;
        if (params.type != '')
            url = url + '&type=' + params.type;
        if (params.annotote_type != '')
            url = url + '&annotote_type=' + params.annotote_type;
        if (params.time != 0)
            url = url + '&time=' + params.time;
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
    * Save Anotote to ME Stream API
    * type: {POST}
    * params: [annotote_id, user_id, created_at]
    */
    public save_anotote_to_me_stream(params) {
        var url = this.constants.API_BASEURL + '/save-annotote';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
    * Add Tag to Anotote API
    * type: {POST}
    * params: [user_tote_id, tag_text, created_at]
    */
    public add_tag_to_anotote(params) {
        var url = this.constants.API_BASEURL + '/annotote/createTag';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
    * Add Tag to Anotote API
    * type: {POST}
    * params: [tag_id, annotation_id, text, created_at]
    */
    public add_tag_to_anotation(params) {
        var url = this.constants.API_BASEURL + '/annotote/highlight/createTag';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
     * Add tags to chat tote
     */
    public add_tag_to_chatTote(params) {
        var url = this.constants.API_BASEURL + '/chat/createTag';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
     * Add tags to chat message
     */
    public add_tag_to_message(params) {
        var url = this.constants.API_BASEURL + '/chat/createMessageTag';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    public add_tag_to_anotation_all(params) {
        var url = this.constants.API_BASEURL + '/annotote/highlight/createTagAll';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    public autocomplete_users(params) {
        var url = this.constants.API_BASEURL + '/search/followers?name_like=' + params.name;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }


    /**
    * Load advance search results  API
    * type: {GET}
    * params: [text_string]
    */
    public get_search_results(txt_string) {
        var url = this.constants.SEARCH_API_BASEURL + '/select?indent=on&wt=json&q=type:annotote&fq=' + txt_string;
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
    * Update Anotation API
    * type: {POST}
    * params: [annotation_id, highlight_text, file_text, comment, identifier, updated_at]
    */
    public update_anotation(params) {
        var url = this.constants.API_BASEURL + '/annotote/highlight/update';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    /**
    * Reorder Anotation API
    * type: {POST}
    * params: [annotation_ids, order]
    */
    public reorder_anotation(params) {
        var url = this.constants.API_BASEURL + '/annotote/highlight/updateOrder';
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

    public vote_anotation(params) {
        var url = this.constants.API_BASEURL + '/annotote/highlight/vote';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    public addToMeStream(params) {
        var url = this.constants.API_BASEURL + '/annotote/addToMeStream';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }

    public add_tags_to_profile(params) {
        var url = this.constants.API_BASEURL + '/user/createTag';
        var response = this.http.post(url, params).map(res => res.json());
        return response;
    }
}
