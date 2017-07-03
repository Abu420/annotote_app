import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, NavParams } from 'ionic-angular';
import { Profile } from '../follows/follows_profile';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { AuthenticationService } from '../../services/auth.service';

@Component({
  selector: 'home_settings',
  templateUrl: 'settings.html',
})
export class Settings {
  public current_user: any;

  constructor(params: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public searchService: SearchService, public viewCtrl: ViewController, public authService: AuthenticationService) {
    this.current_user = this.authService.getUser();
  }

  logout() {
    this.dismiss('logout');
  }

  showProfile() {
    this.utilityMethods.show_loader('Please wait...');
    this.searchService.get_user_profile_info(this.current_user.id)
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
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
  }

  dismiss(action) {
    if (action)
      this.viewCtrl.dismiss(action);
    else
      this.viewCtrl.dismiss();
  }

}