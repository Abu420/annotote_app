import { Component, trigger, transition, style, animate, NgZone, state } from '@angular/core';
import { IonicPage, ModalController, ViewController } from 'ionic-angular';
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
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ transform: 'translateY(100%)', opacity: 0 }),
          animate('300ms', style({ transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateY(0)', opacity: 1 }),
          animate('300ms', style({ transform: 'translateY(100%)', opacity: 0 }))
        ])
      ]
    )
  ],
  templateUrl: 'follows.html',
})
export class Follows {
  private followings: any;
  private _loading: boolean;
  private no_followers_found: boolean = false;
  public show: boolean = true;
  public flyInOutState: String = 'out';

  constructor(public constants: Constants,
    public viewCtrl: ViewController,
    public searchService: SearchService,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    public utilityMethods: UtilityMethods) {
    this.followings = [];
  }

  ionViewDidLoad() {
    this._loading = false;
    this.load_follows_list();
  }

  dismiss(action) {
    this.show = false;
    setTimeout(() => {
      this.viewCtrl.dismiss();
    }, 300)
  }

  showProfile(follower) {
    var toast = this.utilityMethods.doLoadingToast('Loading Profile');
    this.searchService.get_user_profile_info(follower.id)
      .subscribe((response) => {
        toast.dismiss();
        this.presentProfileModal(response);
      }, (error) => {
        toast.dismiss();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        } else {
          this.utilityMethods.doToast("Couldn't load profile")
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
