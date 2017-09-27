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
import { ChatService } from '../../services/chat.service';
import { AuthenticationService } from '../../services/auth.service';

@Component({
    selector: 'chat_tote_page',
    templateUrl: 'chat_tote.html',
})
export class ChatToteOptions {

    public search_txt: string;
    public usersForChat: string;
    public initiateChat: boolean = false;
    public search_loading: boolean = false;
    public anotote: any = null;
    public search_results: any = [];
    public stream: string = '';
    public from;

    constructor(public params: NavParams, public navCtrl: NavController, public utilityMethods: UtilityMethods, public viewCtrl: ViewController, public searchService: SearchService) {
        this.anotote = params.get('anotote');
        this.stream = params.get('stream');
        if (params.get('from'))
            this.from = params.get('from');
        if (this.anotote != null && this.stream != 'top' && this.stream != 'anon')
            this.search_txt = this.anotote.userAnnotote.annotote.title;
        else if (this.anotote != null && (this.stream == 'top' || this.stream == 'anon'))
            this.search_txt = this.anotote.annotote.title;

    }

    dissmiss() {
        this.viewCtrl.dismiss({ close: true });
    }

    findChatter() {
        this.initiateChat = true;
    }

    value_updating_search() {
        this.search_loading = true;
        var params = {
            term: this.usersForChat,
            type: 'user',
            annotote_type: '',
            time: 0
        }
        this.searchService.general_search(params)
            .subscribe((response) => {
                this.search_results = [];
                for (let user of response.data.user) {
                    this.search_results.push(user);
                }
                this.search_loading = false;
            }, (error) => {
                this.search_loading = false;
                if (error.code == -1) {
                    this.utilityMethods.internet_connection_error();
                }
            });
    }

    saveThis() {
        this.viewCtrl.dismiss({ chat: false, close: false, save: true })
    }

    addToMeStream() {
        this.viewCtrl.dismiss({ chat: false, close: false, save: false, add: true })
    }

    bookmarkThis() {
        this.viewCtrl.dismiss({ chat: false, close: false, save: false, bookmark: true })
    }

    send_message(user) {
        this.viewCtrl.dismiss({ chat: true, close: false, user: user, title: this.search_txt })
    }
}