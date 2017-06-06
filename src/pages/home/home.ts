import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, ModalController, Platform } from 'ionic-angular';
import { Follows } from '../follows/follows';
import { Notifications } from '../notifications/notifications';
import { Settings } from '../home/settings';
import { TopInterests } from '../home/top_interests';
import { TopOptions } from '../home/top_options';
import { AnototeList } from '../anotote-list/anotote-list';
import { SearchResults } from '../search-results/search-results';
import { FrontViewPage } from '../front-view/front-view';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { AuthenticationService } from '../../services/auth.service';
/**
 * Generated class for the Home page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class Home {

  constructor(public platform: Platform, public appCtrl: App, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public authService: AuthenticationService) {
  }

  /**
   * View Events
   */
  ionViewDidLoad() {
  }

  notifications() {
    // this.navCtrl.push(Notifications, {});
    let notifications = this.modalCtrl.create(Notifications, null);
    notifications.present();
  }

  follows(event) {
    event.stopPropagation();
    this.navCtrl.push(Follows, {});
  }

  presentTopOptionsModal(event) {
    event.stopPropagation();
    let topOptionsModal = this.modalCtrl.create(TopOptions, null);
    topOptionsModal.onDidDismiss(data => {
      if (data == 'interests') {
        let topInterestsModal = this.modalCtrl.create(TopInterests, null);
        topInterestsModal.present();
      }
    });
    topOptionsModal.present();
  }

  presentTopInterestsModal() {
    let topInterestsModal = this.modalCtrl.create(TopInterests, null);
    topInterestsModal.present();
  }

  openAnototeList(color) {
    this.navCtrl.push(AnototeList, { color: color });
  }

  openSearchResults() {
    this.navCtrl.push(SearchResults, {});
  }

  presentSettingsModal(event) {
    event.stopPropagation();
    let self = this;
    let settingsModal = this.modalCtrl.create(Settings, null);
    settingsModal.onDidDismiss(data => {
      if (data == 'logout') {
        /**
         * API call, after Successfull validation
         */
        var current_time = (new Date()).getTime() / 1000,
          platform_name = this.platform.is('ios') ? 'ios' : 'android';
        this.utilityMethods.show_loader('Please wait...');
        this.authService.logout()
          .subscribe((response) => {
            self.utilityMethods.hide_loader();
            self.authService.clear_user();
            self.appCtrl.getRootNav().setRoot(FrontViewPage);
          }, (error) => {
            this.utilityMethods.hide_loader();
            this.utilityMethods.message_alert('Error', 'Logout operation failed, please try again or later.');
            self.authService.clear_user();
          });
      }
    });
    settingsModal.present();
  }

}
