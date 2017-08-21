import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
import { AnototeList } from '../anotote-list/anotote-list';
import { Profile } from '../follows/follows_profile';

import { UtilityMethods } from '../../services/utility_methods';
import { AuthenticationService } from "../../services/auth.service";
import { SearchService } from '../../services/search.service';
import { Constants } from '../../services/constants.service';
/**
 * Generated class for the Follows page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-follows',
  templateUrl: 'follows.html',
})
export class Follows {
  private followings: any;
  private _loading: boolean;
  private no_followers_found: boolean = false;

  constructor(public constants: Constants, public navCtrl: NavController, public searchService: SearchService, public authService: AuthenticationService, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods) {
    this.followings = [];
  }

  ionViewDidLoad() {
    this._loading = false;
    this.load_follows_list();
  }

  showProfile(follower) {
    this.utilityMethods.show_loader('Please wait...');
    this.searchService.get_user_profile_info(follower.id)
      .subscribe((response) => {
        this.utilityMethods.hide_loader();
        this.presentProfileModal(response);
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
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

  load_follows_list() {
    this.authService.get_follows()
      .subscribe((res) => {
        this._loading = true;
        this.followings = res.data.user;
        if (this.followings.length == 0) {
          this.no_followers_found = true;
        }
      }, (error) => {
        this._loading = true;
      });
  }

}
