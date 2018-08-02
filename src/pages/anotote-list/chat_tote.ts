import { Component } from '@angular/core';
import { NavController, ViewController, NavParams, ModalController } from 'ionic-angular';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { ChatService } from '../../services/chat.service';
import { AuthenticationService } from '../../services/auth.service';
import { Streams } from '../../services/stream.service';
import { SearchUnPinned } from "../../models/search";
import { AnototeService } from '../../services/anotote.service';
import { mapper } from '../../models/mapper';

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
    public webUrlEntered: boolean = false;
    public doChat: boolean = false;
    public doSave: boolean = false;
    public doBookmark: boolean = false;
    public forChats: boolean = false;
    public selectedUser;
    public user;

    constructor(public runtime: Streams,
        public params: NavParams,
        public navCtrl: NavController,
        public anototeService: AnototeService,
        public chatService: ChatService,
        public utilityMethods: UtilityMethods,
        public viewCtrl: ViewController,
        public authService: AuthenticationService,
        public searchService: SearchService,
        public modalCtrl: ModalController) {
        this.anotote = params.get('anotote');
        this.stream = params.get('stream');
        this.user = authService.getUser();
        if (params.get('from'))
            this.from = params.get('from');
        if (this.anotote != null && this.stream != 'top' && this.stream != 'anon')
            this.search_txt = this.anotote.userAnnotote.anototeDetail.userAnnotote.annototeTitle;
        else if (this.anotote != null && (this.stream == 'top' || this.stream == 'anon'))
            this.search_txt = this.anotote.annotote.title;
        if (params.get('findChatter')) {
            this.findChatter();
            if (params.get('doChat'))
                this.doChat = true;
        }
        if (this.from == 'profile') {
            this.doChat = true;
            this.send_message(params.get('user'));
        }
    }

    dissmiss() {
        this.viewCtrl.dismiss({ close: true });
    }

    findChatter() {
        //when user opts to clear field or first comes in the field to chat
        this.initiateChat = true;
    }

    clearTote() {
        this.initiateChat = true;
        this.anotote = null;
    }

    doSomething(what) {
        this.initiateChat = true;
        if (what == 'chat')
            this.doChat = true;
        else if (what == 'bookmark')
            this.doBookmark = true;
        else if (what == 'save')
            this.doSave = true;
    }

    value_updating_search() {
        if (this.utilityMethods.isWEBURL(this.usersForChat)) {
            this.search_results = [];
            this.webUrlEntered = true;
        } else {
            if (this.usersForChat != '') {
                this.search_results = [];
                this.search_loading = true;
                this.webUrlEntered = false;
                var params = {
                    term: this.usersForChat,
                    type: 'user',
                    annotote_type: '',
                    time: 0
                }
                this.searchService.general_search(params)
                    .subscribe((response) => {
                        if (this.usersForChat != '') {
                            this.search_results = [];
                            for (let user of response.data.user) {
                                user.follow_loading = false;
                                this.search_results.push(user);
                            }
                            this.search_loading = false;
                        } else {
                            this.search_results = [];
                        }
                    }, (error) => {
                        this.search_loading = false;
                        if (error.code == -1) {
                            this.utilityMethods.internet_connection_error();
                        }
                    });
            } else {
                this.webUrlEntered = false;
                this.search_loading = false;
            }
        }
    }

    scrape_this_url(save_or_bookmark) {
        if (this.usersForChat != '' && this.usersForChat != null) {
            var current_time = this.utilityMethods.get_php_wala_time();
            var params = {
                url: this.usersForChat,
                created_at: current_time,
                scraped_url: ''
            }
            var toast = null;
            if (save_or_bookmark == 'save') {
                this.viewCtrl.dismiss({ chat: false, close: false, save: false, browser: true, tote: this.usersForChat });
                return;
            } else
                toast = this.utilityMethods.doLoadingToast('Bookmarking...');
            this.searchService.hypothesis_scrapping(params).subscribe((success) => {
                params.scraped_url = success.successMessage;
                this.searchService.create_anotote(params)
                    .subscribe((response) => {
                        if (save_or_bookmark != 'save') {
                            toast.dismiss()
                            var bookmark = new SearchUnPinned(save_or_bookmark == 'save' ? 0 : 1,
                                response.data.annotote.title, this.usersForChat,
                                this.authService.getUser().id, 0);
                            if (this.searchService.AlreadySavedSearches(bookmark.term)) {
                                this.searchService.saved_searches.unshift(bookmark);
                            }
                            response.data.userAnnotote.annotote = response.data.annotote;
                            this.dissmiss();
                        } else {
                            var params: any = {
                                annotote_id: response.data.annotote.id,
                                user_id: this.authService.getUser().id,
                                created_at: response.data.annotote.createdAt
                            }
                            this.anototeService.save_totes(params).subscribe((result) => {
                                toast.dismiss()
                                this.runtime.follow_first_load = false;
                                this.runtime.me_first_load = false;
                                this.runtime.top_first_load = false;
                                this.viewCtrl.dismiss({ chat: false, close: false, save: false, browser: true, tote: response.data })
                            }, (error) => {
                                toast.dismiss();
                                this.search_loading = false;
                                if (error.status == 500) {
                                    this.utilityMethods.message_alert("Ooops", "Couldn't scrape this url.");
                                }
                                else if (error.code == -1) {
                                    this.utilityMethods.internet_connection_error();
                                }
                            })
                        }
                    }, (error) => {
                        toast.dismiss();
                        this.search_loading = false;
                        if (error.status == 500) {
                            this.utilityMethods.message_alert("Ooops", "Couldn't scrape this url.");
                        } else if (error.code == -1) {
                            this.utilityMethods.internet_connection_error();
                        } else
                            this.utilityMethods.doToast("Couldn't scrap url");
                    });
            }, (error) => {
                toast.dismiss();
                this.search_loading = false;
                if (error.status == 500) {
                    this.utilityMethods.message_alert("Ooops", "Couldn't scrape this url.");
                } else if (error.code == -1) {
                    this.utilityMethods.internet_connection_error();
                } else
                    this.utilityMethods.doToast("Couldn't scrap url");
            });
        } else {
            this.doSomething(save_or_bookmark);
        }
    }

    for_scrapping(cond) {
        if (this.utilityMethods.isWEBURL(this.usersForChat))
            this.scrape_this_url(cond);
        else
            this.utilityMethods.doToast("Please enter a url");
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
        var incoming = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            description: user.description
        }
        this.viewCtrl.dismiss({ chat: true, close: false, user: incoming, title: this.anotote == null ? '' : (this.stream == 'top' || this.stream == 'anon') == true ? this.anotote.annotote.title : this.anotote.userAnnotote.anototeDetail.userAnnotote.annototeTitle })
    }

    openChat(group, user) {
        group.is_tote = false;
        group.isChat = true;
        var chattote = new mapper(group, this.user);
        var incoming = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            description: user.description
        }
        this.viewCtrl.dismiss({ chat: true, close: false, user: incoming, title: this.anotote == null ? '' : (this.stream == 'top' || this.stream == 'anon') == true ? this.anotote.annotote.title : this.anotote.userAnnotote.anototeDetail.userAnnotote.annototeTitle, group: chattote })
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
}