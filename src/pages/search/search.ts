import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, ModalController } from 'ionic-angular';
import { Profile } from '../follows/follows_profile';
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

    constructor(public params: NavParams, public utilityMethods: UtilityMethods, public viewCtrl: ViewController, public searchService: SearchService, public modalCtrl: ModalController) {
        this.search_results = [];
        this.search_txt = "";
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    presentTopInterestsModal() {
        this.viewCtrl.dismiss('interests');
    }

    followUser(event, follows_id) {
        event.stopPropagation();
        let self = this;
        var current_time = (new Date()).getTime() / 1000;
        this.utilityMethods.show_loader('Please wait...');
        this.searchService.follow_user({
            created_at: current_time,
            follows_id: follows_id
        }).subscribe((response) => {
            this.utilityMethods.hide_loader();
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
        this.search_loading = true;
        this.searchService.general_search(this.search_txt)
            .subscribe((response) => {
                this.search_results = response.data.users;
                this.search_loading = false;
            }, (error) => {
                this.search_results = [];
                this.search_loading = false;
                // self.utilityMethods.message_alert('Error', 'No matching results found');
            });
    }

    showProfile(user_id) {
        this.utilityMethods.show_loader('Please wait...');
        this.searchService.get_user_profile_info(user_id)
            .subscribe((response) => {
                this.utilityMethods.hide_loader();
                let profile = this.modalCtrl.create(Profile, {
                    data: response.data
                });
                profile.onDidDismiss(data => {
                });
                profile.present();
            }, (error) => {
                this.utilityMethods.hide_loader();
            });
    }

    changeColor(str) {

    }

}