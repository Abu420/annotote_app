import { Component } from '@angular/core';
import { NavController, ViewController, NavParams, ModalController, Events } from 'ionic-angular';
import { Profile } from '../follows/follows_profile';
import { AnototeOptions } from '../anotote-list/tote_options';
import { AnototeEditor } from '../anotote-editor/anotote-editor';
import { SearchResults } from '../search-results/search-results';
/**
 * Services
 */
import { Constants } from '../../services/constants.service';
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';

@Component({
    selector: 'chat_tote_page',
    templateUrl: 'chat_tote.html',
})
export class ChatToteOptions {

    public search_txt: string;
    public search_results: any;
    public entering_url: boolean;
    public current_url: string;
    public filter_mode: boolean;
    public search_loading: boolean;
    public stream_color: string;
    public new_tote: any = {};

    constructor(public constants: Constants, public params: NavParams, public navCtrl: NavController, public events: Events, public utilityMethods: UtilityMethods, public viewCtrl: ViewController, public searchService: SearchService, public modalCtrl: ModalController) {
        this.search_results = [];
        this.search_txt = "";
        this.entering_url = false;
        this.filter_mode = false;

    }
}