import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
import { AnototeList } from '../anotote-list/anotote-list';
import { Profile } from '../follows/follows_profile';

import { UtilityMethods } from '../../services/utility_methods';
import { AuthenticationService } from "../../services/auth.service";
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

  constructor(public navCtrl: NavController, public authService: AuthenticationService, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods) {
    this.followings = [];
  }

  ionViewDidLoad() {
    this._loading = false;
    this.load_follows_list();
  }

  presentProfileModal() {
    let profileModal = this.modalCtrl.create(Profile, { userId: 8675309 });
    profileModal.present();
  }

  load_follows_list() {
    this.authService.get_follows()
      .subscribe((res) => {
        this._loading = true;
        this.followings = res.data.user;
        console.log(res);
      }, (error) => {
        this._loading = true;
        console.log(error);
      });
  }

}
