import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, ModalController, Events } from 'ionic-angular';
import { Profile } from '../follows/follows_profile';
import { AnototeEditor } from '../anotote-editor/anotote-editor';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';

@Component({
    selector: 'search_page',
    templateUrl: 'search.html',
})
export class Search {

    public search_txt: string;
    public search_results: any;
    public search_loading: boolean;

    constructor(public params: NavParams, public navCtrl: NavController, public events: Events, public utilityMethods: UtilityMethods, public viewCtrl: ViewController, public searchService: SearchService, public modalCtrl: ModalController) {
        this.search_results = [];
        this.search_txt = "";

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

    dismiss() {
        this.viewCtrl.dismiss();
    }

    presentTopInterestsModal() {
        this.viewCtrl.dismiss('interests');
    }

    followUser(event, person) {
        event.stopPropagation();
        let self = this;
        var current_time = (new Date()).getTime() / 1000;
        this.utilityMethods.show_loader('Please wait...');
        this.searchService.follow_user({
            created_at: current_time,
            follows_id: person.id
        }).subscribe((response) => {
            this.utilityMethods.hide_loader();
            person.isFollowed = 1;
            console.log(response);
        }, (error) => {
            this.utilityMethods.hide_loader();
        });
    }

    unFollowUser(event, person) {
        event.stopPropagation();
        let self = this;
        var current_time = (new Date()).getTime() / 1000;
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
        });
    }

    value_updating_search(value) {
        this.search_txt = value;
        if (value.length == 0) {
            this.search_results = [];
            return;
        }
        let self = this;

        var url_or_user = this.utilityMethods.isWEBURL(this.search_txt); // False for USER && True for URL case
        var current_time = (new Date()).getTime() / 1000;
        this.search_loading = true;
        if (!url_or_user)
            this.searchService.general_search(this.search_txt)
                .subscribe((response) => {
                    console.log(response)
                    this.search_results = response.data.users;
                    this.search_loading = false;
                }, (error) => {
                    this.search_results = [];
                    this.search_loading = false;
                    // self.utilityMethods.message_alert('Error', 'No matching results found');
                });
        else {
            this.utilityMethods.show_loader('Please wait...');
            this.searchService.create_anotote({ url: this.search_txt, created_at: current_time })
                .subscribe((response) => {
                    this.searchService.get_anotote_content(response.data.annotote.localLink)
                        .subscribe((response) => {
                            this.utilityMethods.hide_loader();
                            this.go_to_browser(response.text());
                        }, (error) => {
                            this.utilityMethods.hide_loader();
                            this.search_loading = false;
                        });
                }, (error) => {
                    this.utilityMethods.hide_loader();
                    this.search_loading = false;
                });
        }
    }

    go_to_browser(scrapped_txt) {
        this.navCtrl.push(AnototeEditor, { tote_txt: scrapped_txt });
        this.dismiss()
    }

    showProfile(user_id) {
        this.utilityMethods.show_loader('Please wait...');
        this.searchService.get_user_profile_info(user_id)
            .subscribe((response) => {
                this.utilityMethods.hide_loader();
                this.presentProfileModal(response);
            }, (error) => {
                this.utilityMethods.hide_loader();
            });
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

    changeColor(str) {

    }

}