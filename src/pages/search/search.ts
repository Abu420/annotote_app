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
    selector: 'search_page',
    templateUrl: 'search.html',
})
export class Search {

    public search_txt: string;
    public search_results: any;
    public entering_url: boolean;
    public current_url: string;
    public filter_mode: boolean;
    public search_loading: boolean;
    public stream_color: string;
    public new_tote: any = {};
    private search_filters = {
        media: {
            tote: false,
            user: false
        },
        category: {
            me: false,
            follows: false,
            top: false
        },
        date: {
            year: '',
            month: '',
            day: ''
        }
    }

    constructor(public constants: Constants, public params: NavParams, public navCtrl: NavController, public events: Events, public utilityMethods: UtilityMethods, public viewCtrl: ViewController, public searchService: SearchService, public modalCtrl: ModalController) {
        this.search_results = [];
        this.search_txt = "";
        this.entering_url = false;
        this.filter_mode = false;
        /**
         * Set Current Active Anotote Link in search field
         */
        this.stream_color = params.get('stream');
        this.current_url = params.get('link');
        if (this.current_url != '' && this.current_url != undefined)
            this.search_txt = this.current_url;
        var saved_search_txt = params.get('saved_searched_txt');
        if (saved_search_txt != null)
            this.search_txt = saved_search_txt;


        /**
             * User followed Event Subscriber
             */
        events.subscribe('user:followed', (id) => {
            for (let user of this.search_results) {
                if (user.id == id) {
                    user.isFollowed = 1;
                    break;
                }
            }
        });

        /**
         * User unFollowed Event Subscriber
         */
        events.subscribe('user:unFollowed', (id) => {
            for (let user of this.search_results) {
                if (user.id == id) {
                    user.isFollowed = 0;
                    break;
                }
            }
        });
    }

    anotote_or_user_filter(choice) {
        if (choice == 'tote') {
            if (this.search_filters.media.tote) {
                this.search_filters.media.tote = false;
            } else {
                this.search_filters.media.tote = true;
                this.search_filters.media.user = false;
            }
        } else {
            if (this.search_filters.media.user) {
                this.search_filters.media.user = false;
            } else {
                this.search_filters.media.user = true;
                this.search_filters.media.tote = false;
            }
        }

    }

    category_filter(choice) {
        if (choice == 'me') {
            if (this.search_filters.category.me) {
                this.search_filters.category.me = false;
            } else {
                this.search_filters.category.me = true;
                this.search_filters.category.follows = false;
                this.search_filters.category.top = false;
            }
        } else if (choice == 'follows') {
            if (this.search_filters.category.follows) {
                this.search_filters.category.follows = false;
            } else {
                this.search_filters.category.follows = true;
                this.search_filters.category.me = false;
                this.search_filters.category.top = false;
            }
        }
        else if (choice == 'top') {
            if (this.search_filters.category.top) {
                this.search_filters.category.top = false;
            } else {
                this.search_filters.category.top = true;
                this.search_filters.category.me = false;
                this.search_filters.category.follows = false;
            }
        }
    }

    dismiss() {
        this.events.unsubscribe('user:followed');
        this.events.unsubscribe('user:unFollowed');
        this.viewCtrl.dismiss(this.new_tote);
    }

    presentTopInterestsModal() {
        this.viewCtrl.dismiss('interests');
    }

    show_share_options() {
        let toteOptions = this.modalCtrl.create(AnototeOptions, {
            share_content: this.current_url,
            share_type: 'search'
        });
        toteOptions.onDidDismiss(data => {
        });
        toteOptions.present();
    }

    clear_deep_link() {
        this.current_url = null;
        this.search_txt = '';
    }

    show_filters() {
        this.filter_mode = !this.filter_mode;
    }

    save_search_entry(save_or_bookmark) {
        let self = this;
        var current_time = this.utilityMethods.get_php_wala_time();
        var params = {
            created_at: this.utilityMethods.get_php_wala_time(),
            searched_term: this.search_txt,
            book_marked: 0
        }
        if (save_or_bookmark == 'save_entry')
            params.book_marked = 0;
        else if (save_or_bookmark == 'bookmark_entry')
            params.book_marked = 1;
        this.searchService.save_search_entry(params).subscribe((response) => {
            this.utilityMethods.hide_loader();
            if (save_or_bookmark == 'save_entry')
                this.utilityMethods.doToast("Saved to search stream successfully!");
            else if (save_or_bookmark == 'bookmark_entry')
                this.utilityMethods.doToast("Bookmarked successfully!");
            this.events.publish('new_search_added', { entry: response.data.search });
        }, (error) => {
            this.utilityMethods.hide_loader();
            if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
            }
        });
    }

    get_search_results() {
        this.save_search_entry('save_entry');
        var params = {
            search_term: this.search_txt,
            results: this.search_results
        }
        this.dismiss();
        this.navCtrl.push(SearchResults, params);
    }

    followUser(event, person) {
        event.stopPropagation();
        let self = this;
        var current_time = this.utilityMethods.get_php_wala_time();
        person.follow_loading = true;
        this.searchService.follow_user({
            created_at: current_time,
            follows_id: person.id
        }).subscribe((response) => {
            person.follow_loading = false;
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

    unFollowUser(event, person) {
        event.stopPropagation();
        let self = this;
        var current_time = this.utilityMethods.get_php_wala_time();
        this.utilityMethods.show_loader('Please wait...');
        this.searchService.un_follow_user({
            created_at: current_time,
            follows_id: person.id
        }).subscribe((response) => {
            this.utilityMethods.hide_loader();
            person.isFollowed = 0;
            console.log(response);
        }, (error) => {
            this.utilityMethods.hide_loader();
            if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
            }
        });
    }

    /**
     * Text field value updating event
     */
    value_updating_search() {
        // this.search_txt = value;
        console.log(this.search_filters.date);
        this.search_results = [];
        if (this.search_txt.length == 0) {
            this.current_url = '';
            this.search_results = [];
            return;
        }
        if (this.filter_mode)
            this.filter_mode = false;

        var url_or_user = this.utilityMethods.isWEBURL(this.search_txt); // False for USER && True for URL case
        var current_time = this.utilityMethods.get_php_wala_time();
        this.search_loading = true;
        if (!url_or_user) {
            this.entering_url = false;
            var params = {
                term: this.search_txt,
                type: '',
                annotote_type: '',
                time: 0
            }
            //type filter
            if (this.search_filters.media.tote) {
                params.type = 'annotote';
                //stream filter
                if (this.search_filters.category.me)
                    params.annotote_type = 'me';
                else if (this.search_filters.category.follows)
                    params.annotote_type = 'follows';
                else if (this.search_filters.category.top)
                    params.annotote_type = 'top';

                //date filter
                if (this.search_filters.date.year != '' && this.search_filters.date.month != '' && this.search_filters.date.day != '') {
                    params.time = this.utilityMethods.get_time(this.search_filters.date.day + '/' + this.search_filters.date.month + '/' + this.search_filters.date.year);
                }
            } else if (this.search_filters.media.user)
                params.type = 'user';

            this.searchService.general_search(params)
                .subscribe((response) => {
                    for (let tote of response.data.annotote) {
                        if (tote.annotote) {
                            tote.is_tote = true;
                            this.search_results.push(tote);
                        }
                    }
                    for (let user of response.data.user) {
                        user.is_tote = false;
                        user.follow_loading = false;
                        this.search_results.push(user);
                    }
                    this.search_loading = false;
                }, (error) => {
                    this.search_results = [];
                    this.search_loading = false;
                    // self.utilityMethods.message_alert('Error', 'No matching results found');
                });
        } else {
            this.search_loading = false;
            this.entering_url = true;
        }
    }

    scrape_this_url() {
        var current_time = this.utilityMethods.get_php_wala_time();
        this.utilityMethods.show_loader('Please wait...');
        /**
         * Create Anotote API
         */
        this.searchService.create_anotote({ url: this.search_txt, created_at: current_time })
            .subscribe((response) => {
                this.utilityMethods.hide_loader();
                this.new_tote.active = false;
                this.new_tote.type = 1;
                this.new_tote.createdAt = response.data.userAnnotote.createdAt
                this.new_tote.userAnnotote = response.data.userAnnotote;
                this.new_tote.userAnnotote.annotote = response.data.annotote;
                this.go_to_browser(response.data);
            }, (error) => {
                this.utilityMethods.hide_loader();
                this.search_loading = false;

                if (error.status == 500) {
                    this.utilityMethods.message_alert("Ooops", "Couldn't scrape this url.");
                }
                else if (error.code == -1) {
                    this.utilityMethods.internet_connection_error();
                }
            });
    }

    go_to_browser(anotote) {
        this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'search', WHICH_STREAM: 'me' });
        this.dismiss()
    }

    showProfile(search_result) {
        if (search_result.is_tote) {
            this.go_to_browser(search_result);
        } else {
            this.utilityMethods.show_loader('');
            this.searchService.get_user_profile_info(search_result.id)
                .subscribe((response) => {
                    this.utilityMethods.hide_loader();
                    if (response.data.user != null)
                        this.presentProfileModal(response);
                    else
                        this.utilityMethods.doToast("Couldn't load user.");
                }, (error) => {
                    this.utilityMethods.hide_loader();
                    if (error.code == -1) {
                        this.utilityMethods.internet_connection_error();
                    }
                });
        }
    }

    presentProfileModal(response) {
        let profile = this.modalCtrl.create(Profile, {
            data: response.data,
            from_page: 'search_results'
        });
        profile.onDidDismiss(data => {
        });
        profile.present();
    }
}