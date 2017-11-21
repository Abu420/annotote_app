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
import { Streams } from '../../services/stream.service';

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

    constructor(public runtime: Streams,
        public params: NavParams,
        public navCtrl: NavController,
        public utilityMethods: UtilityMethods,
        public viewCtrl: ViewController,
        public searchService: SearchService,
        public modalCtrl: ModalController) {
        this.anotote = params.get('anotote');
        this.stream = params.get('stream');
        if (params.get('from'))
            this.from = params.get('from');
        if (this.anotote != null && this.stream != 'top' && this.stream != 'anon')
            this.search_txt = this.anotote.userAnnotote.anototeDetail.userAnnotote.annototeTitle;
        else if (this.anotote != null && (this.stream == 'top' || this.stream == 'anon'))
            this.search_txt = this.anotote.annotote.title;
        if (params.get('findChatter')) {
            this.findChatter();
        }
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
                    user.follow_loading = false;
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

    followUser(event, person) {
        event.stopPropagation();
        var current_time = this.utilityMethods.get_php_wala_time();
        person.follow_loading = true;
        this.searchService.follow_user({
            created_at: current_time,
            follows_id: person.id
        }).subscribe((response) => {
            person.follow_loading = false;
            this.runtime.follow_first_load = false;
            this.runtime.me_first_load = false;
            this.runtime.top_first_load = false;
            if (response.status == 1)
                person.isFollowed = 1;
            else
                this.utilityMethods.doToast("Couldn't follow.");
        }, (error) => {
            this.utilityMethods.hide_loader();
            if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
            }
        });
    }

    showProfile(search_result) {
        this.utilityMethods.show_loader('');
        this.searchService.get_user_profile_info(search_result.id)
            .subscribe((response) => {
                this.utilityMethods.hide_loader();
                if (response.data.user != null) {
                    let profile = this.modalCtrl.create(Profile, {
                        data: response.data,
                        from_page: 'search_results'
                    });
                    profile.onDidDismiss(data => {
                    });
                    profile.present();
                } else
                    this.utilityMethods.doToast("Couldn't load user.");
            }, (error) => {
                this.utilityMethods.hide_loader();
                if (error.code == -1) {
                    this.utilityMethods.internet_connection_error();
                }
            });
    }
}