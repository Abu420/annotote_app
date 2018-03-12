import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavController, ViewController, NavParams, ModalController, Events, Content } from 'ionic-angular';
import { Profile } from '../follows/follows_profile';
import { AnototeOptions } from '../anotote-list/tote_options';
import { AnototeEditor } from '../anotote-editor/anotote-editor';
import { SearchResults } from '../search-results/search-results';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { Streams } from '../../services/stream.service';
import { SearchUnPinned } from '../../models/search';
import { AuthenticationService } from '../../services/auth.service';
import { AnototeService } from "../../services/anotote.service";
import { Keyboard } from "@ionic-native/keyboard";
import { StatusBar } from "@ionic-native/status-bar";

@Component({
    selector: 'search_page',
    templateUrl: 'search.html',
})
export class Search {

    @ViewChild(Content) content: Content;
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
    private from;
    public isOpen: boolean = false;

    constructor(public stream: Streams,
        public params: NavParams,
        public navCtrl: NavController,
        public events: Events,
        public statusBar: StatusBar,
        public utilityMethods: UtilityMethods,
        public viewCtrl: ViewController,
        public searchService: SearchService,
        public modalCtrl: ModalController,
        public anototeService: AnototeService,
        public authService: AuthenticationService,
        public cd: ChangeDetectorRef,
        public key: Keyboard) {
        // key.onKeyboardShow().subscribe(() => {
        //     if (utilityMethods.whichPlatform() == 'ios') {
        //         this.isOpen = true;
        //     }
        // })
        // key.onKeyboardHide().subscribe(() => {
        //     if (utilityMethods.whichPlatform() == 'ios') {
        //         this.isOpen = false;
        //         this.cd.detectChanges();
        //     }
        // })
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
        if (saved_search_txt != null) {
            this.search_txt = saved_search_txt;
            this.value_updating_search();
        }
        if (params.get('from')) {
            this.from = params.get('from');
        }
        if (params.get('saveIt')) {
            this.save_search_entry('save_entry');
        }
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

    ionViewDidLoad() {
        this.content.ionScrollStart.subscribe(() => {
            this.key.close();
        })
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

    dismiss(check) {
        this.events.unsubscribe('user:followed');
        this.events.unsubscribe('user:unFollowed');
        this.viewCtrl.dismiss({ editor_check: check });
    }

    presentTopInterestsModal() {
        this.viewCtrl.dismiss('interests');
    }

    show_share_options() {
        // let toteOptions = this.modalCtrl.create(AnototeOptions, {
        //     share_content: this.current_url,
        //     share_type: 'search'
        // });
        // toteOptions.onDidDismiss(data => {
        // });
        // toteOptions.present();
        this.utilityMethods.share_content_native("Anotote", null, null, this.current_url);
    }

    clear_deep_link() {
        this.current_url = null;
        this.search_txt = '';
    }

    show_filters() {
        this.filter_mode = !this.filter_mode;
    }

    save_search_entry(save_or_bookmark) {
        if (this.utilityMethods.isWEBURL(this.search_txt) && save_or_bookmark == 'save_entry') {
            this.scrape_this_url(false, save_or_bookmark)
        } else {
            var bookmark = new SearchUnPinned(save_or_bookmark == 'save_entry' ? 0 : 1,
                '', this.search_txt,
                this.authService.getUser().id, 0);
            if (this.searchService.AlreadySavedSearches(bookmark.term)) {
                this.searchService.saved_searches.unshift(bookmark);
                if (save_or_bookmark == 'save_entry')
                    this.utilityMethods.doToast("Saved");
                else
                    this.utilityMethods.doToast("Bookmarked");
            } else {
                if (save_or_bookmark == 'save_entry')
                    this.utilityMethods.doToast("Already saved");
                else
                    this.utilityMethods.doToast("Already bookmarked");
            }
        }

        // this.utilityMethods.show_loader('Please wait...');
        // let self = this;
        // var current_time = this.utilityMethods.get_php_wala_time();
        // var params = {
        //     created_at: this.utilityMethods.get_php_wala_time(),
        //     searched_term: this.search_txt,
        //     book_marked: 0
        // }
        // if (save_or_bookmark == 'save_entry')
        //     params.book_marked = 0;
        // else if (save_or_bookmark == 'bookmark_entry')
        //     params.book_marked = 1;
        // this.searchService.save_search_entry(params).subscribe((response) => {
        //     if (this.utilityMethods.isWEBURL(this.search_txt))
        //         this.scrape_this_url(false, save_or_bookmark, response.data.search);
        //     else {
        //         this.searchService.saved_searches.unshift(response.data.search);
        //         this.utilityMethods.hide_loader();
        //     }
        //     // this.events.publish('new_search_added', { entry: response.data.search });
        // }, (error) => {
        //     this.utilityMethods.hide_loader();
        //     if (error.code == -1) {
        //         this.utilityMethods.internet_connection_error();
        //     }
        // });
    }

    get_search_results() {
        this.save_search_entry('save_entry');
        var params = {
            search_term: this.search_txt,
            results: this.search_results
        }
        this.dismiss(true);
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
            this.stream.follow_first_load = false;
            this.stream.me_first_load = false;
            this.stream.top_first_load = false;
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
            this.stream.follow_first_load = false;
            this.stream.me_first_load = false;
            this.stream.top_first_load = false;
        }, (error) => {
            this.utilityMethods.hide_loader();
            if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
            }
        });
    }

    bookmark(event, tote) {
        event.stopPropagation();
        if (tote.isBookmarked == true) {
            var search = this.searchService.getAlreadySavedSearches(tote.annotote.link);
            if (search) {
                tote.isBookmarked = false;
                var toast = this.utilityMethods.doLoadingToast("Unpinning bookmark...");
                this.searchService.remove_search_id(search.id)
                    .subscribe((response) => {
                        toast.dismiss();
                        this.searchService.saved_searches.splice(this.searchService.saved_searches.indexOf(search), 1);
                    }, (error) => {
                        toast.dismiss();
                        if (error.code == -1) {
                            this.utilityMethods.internet_connection_error();
                        } else {
                            this.utilityMethods.doToast("Couldn't Unpinn");
                        }
                    });
            }
        } else {
            if (this.searchService.AlreadySavedSearches(tote.annotote.link)) {
                tote.isBookmarked = true;
                var links = [];
                var title = [];
                links.push(tote.annotote.link);
                title.push(tote.annotote.title);
                var params = {
                    user_tote_id: tote.userAnnotote.id,
                    user_id: this.authService.getUser().id,
                    links: links,
                    tote_titles: title,
                    created_at: this.utilityMethods.get_php_wala_time()
                }
                var toast = this.utilityMethods.doLoadingToast("Pinning bookmark...");
                this.anototeService.bookmark_totes(params).subscribe((result) => {
                    toast.dismiss();
                    if (result.status == 1) {
                        if (result.data.exist_count != 1)
                            this.searchService.saved_searches.unshift(result.data.bookmarks[0]);
                    }
                }, (error) => {
                    toast.dismiss();
                    if (error.code == -1) {
                        this.utilityMethods.internet_connection_error();
                    }
                })
            } else {
                tote.isBookmarked = true;
            }
        }
    }

    /**
     * Text field value updating event
     */
    value_updating_search() {
        // this.search_txt = value;
        this.search_results = [];
        if (this.search_txt.length == 0) {
            this.current_url = '';
            this.search_results = [];
            this.statusBar.backgroundColorByHexString('#323232');
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
                    this.search_results = [];
                    for (let tote of response.data.annotote) {
                        if (tote.annotote) {
                            tote.is_tote = true;
                            tote.active = false;
                            tote.userAnnotote.userAnnotote.follows = tote.userAnnotote.follows;
                            tote.userAnnotote.userAnnotote.highlights = tote.userAnnotote.highlights;
                            tote.userAnnotote.userAnnotote.isMe = tote.userAnnotote.isMe;
                            tote.userAnnotote.userAnnotote.isTop = tote.userAnnotote.isTop;
                            var active_tab = 'anon';
                            if (tote.userAnnotote.isMe == 1) {
                                active_tab = 'me'
                            } else if (tote.userAnnotote.isMe == 0 && tote.userAnnotote.isTop == 0) {
                                active_tab = 'follows';
                            } else if (tote.userAnnotote.isTop == 1) {
                                active_tab = 'top';
                            }
                            tote.userAnnotote.active_tab = active_tab;
                            if (tote.userAnnotote.follows.length > 0) {
                                tote.selected_follower_name = tote.userAnnotote.follows[0].firstName;
                            }
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

    scrape_this_url(check, save_or_bookmark) {
        var current_time = this.utilityMethods.get_php_wala_time();
        var params = { url: this.search_txt, created_at: current_time }
        var toast = null;
        if (save_or_bookmark == 'save_entry')
            toast = this.utilityMethods.doLoadingToast('Saving...');
        else if (save_or_bookmark == 'bookmark_entry')
            toast = this.utilityMethods.doLoadingToast('Bookmarking...');
        else
            toast = this.utilityMethods.doLoadingToast('Please wait...');
        // else
        //     params['search_id'] = search.id;
        /**
         * Create Anotote API
         */
        this.searchService.create_anotote(params)
            .subscribe((response) => {
                if (toast)
                    toast.dismiss()
                if (!check) {
                    var bookmark = new SearchUnPinned(save_or_bookmark == 'save_entry' ? 0 : 1,
                        response.data.annotote.title, this.search_txt,
                        this.authService.getUser().id, 0);
                    if (this.searchService.AlreadySavedSearches(bookmark.term)) {
                        this.searchService.saved_searches.unshift(bookmark);
                        // if (save_or_bookmark == 'save_entry')
                        //     this.utilityMethods.doToast("Saved");
                        // else
                        //     this.utilityMethods.doToast("Bookmarked");
                    } else {
                        // if (save_or_bookmark == 'save_entry')
                        //     this.utilityMethods.doToast("Already saved");
                        // else
                        //     this.utilityMethods.doToast("Already bookmarked");
                    }
                }
                response.data.userAnnotote.annotote = response.data.annotote;
                this.go_to_browser(response.data, true);
            }, (error) => {
                toast.dismiss();
                this.search_loading = false;
                if (error.status == 500) {
                    this.utilityMethods.message_alert("Ooops", "Couldn't scrape this url.");
                }
                else if (error.code == -1) {
                    this.utilityMethods.internet_connection_error();
                }
            });
    }

    go_to_browser(anotote, neworold) {
        // if (anotote.userAnnotote.anototeType == 'me')
        //     this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'search', WHICH_STREAM: anotote.userAnnotote.anototeType, actual_stream: anotote.userAnnotote.anototeType });
        // else
        //     this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'search', WHICH_STREAM: 'anon', actual_stream: 'anon' });

        this.events.unsubscribe('user:followed');
        this.events.unsubscribe('user:unFollowed');
        this.viewCtrl.dismiss({ anotote: anotote, go_to_browser: true, neworold: neworold })
    }

    showProfile(search_result) {
        if (search_result.is_tote) {
            this.go_to_browser(search_result, false);
        } else {
            var toast = this.utilityMethods.doLoadingToast('Please wait...');
            this.searchService.get_user_profile_info(search_result.id)
                .subscribe((response) => {
                    toast.dismiss();
                    if (response.data.user != null)
                        this.presentProfileModal(response);
                    else
                        this.utilityMethods.doToast("Couldn't load user.");
                }, (error) => {
                    toast.dismiss();
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