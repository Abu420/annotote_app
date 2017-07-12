import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, NavParams } from 'ionic-angular';
import { Profile } from '../follows/follows_profile';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { AuthenticationService } from '../../services/auth.service';
import { Constants } from '../../services/constants.service'

@Component({
  selector: 'home_settings',
  templateUrl: 'me_options.html',
})
export class MeOptions {
  public current_user: any;

  constructor(params: NavParams, public constants: Constants, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public searchService: SearchService, public viewCtrl: ViewController, public authService: AuthenticationService) {
    this.current_user = this.authService.getUser();
  }

  share_me_tote(type) {
    console.log(type)
    var me_anotote_link = this.constants.API_BASEURL + this.current_user;
    if (type == 'link')
      this.utilityMethods.share_content_native("Me Tote", "Me tote", null, me_anotote_link);
    else if (type == 'facebook')
      this.utilityMethods.share_via_facebook("Me Tote", null, me_anotote_link);
    else if (type == 'twitter')
      this.utilityMethods.share_via_twitter("Me Tote", null, me_anotote_link);
    else if (type == 'email')
      this.utilityMethods.share_via_email("Me Tote", null, me_anotote_link);
  }

  open_settings_menu() {
    this.dismiss('settings');
  }

  dismiss(action) {
    if (action)
      this.viewCtrl.dismiss(action);
    else
      this.viewCtrl.dismiss();
  }

}