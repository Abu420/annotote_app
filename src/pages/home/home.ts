import { Component } from '@angular/core';
import { App, IonicPage, Events, NavController, NavParams, ModalController, Platform } from 'ionic-angular';
import { Follows } from '../follows/follows';
import { Notifications } from '../notifications/notifications';
import { Settings } from '../home/settings';
import { MeOptions } from '../home/me_options';
import { TopInterests } from '../home/top_interests';
import { TopOptions } from '../home/top_options';
import { Search } from '../search/search';
import { AnototeList } from '../anotote-list/anotote-list';
import { SearchResults } from '../search-results/search-results';
import { FrontViewPage } from '../front-view/front-view';
/**
 * Services
 */
import { NotificationService } from '../../services/notifications.service';
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { AuthenticationService } from '../../services/auth.service';
import { StatusBar } from "@ionic-native/status-bar";
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

  private _unread: number;
  public searches: any;
  public latest_searches_firstTime_loading: boolean;

  constructor(public platform: Platform, private events: Events, public searchService: SearchService, public notificationService: NotificationService, public appCtrl: App, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public authService: AuthenticationService, public statusBar: StatusBar) {
    this._unread = 0;
    this.searches = [];
    this.latest_searches_firstTime_loading = true;
  }

  /**
   * View Events
   */
  ionViewDidLoad() {
    this.events.subscribe('new_search_added', (data) => {
      this.searches.splice(0, 0, data.entry);
    });
  }

  ionViewDidLeave() {
    this.events.unsubscribe('new_search_added');
  }

  mySwipeUpAction() {
    // console.log('left')
  }

  mySwipeDownAction() {

  }

  ionViewWillEnter() {
    //console.log('enter')
    /**
     * Load Notifications Count
     */
    this.statusBar.backgroundColorByHexString('#252525');
    this.loadNotifications();
    this.get_search_entries();
  }

  notifications() {
    let notifications = this.modalCtrl.create(Notifications, null);
    notifications.onDidDismiss(data => {
      this.loadNotifications();
    });
    notifications.present();
  }

  follows(event) {
    event.stopPropagation();
    let follows = this.modalCtrl.create(Follows, null);
    follows.onDidDismiss(data => {
    });
    follows.present();
    // this.navCtrl.push(Follows, {});
  }

  open_this_search(search) {
    this.openSearchPopup({ saved_searched_txt: search.term });
  }

  get_search_entries() {
    this.searchService.get_search_entries()
      .subscribe((response) => {
        this.latest_searches_firstTime_loading = false;
        this.searches = response.data.searches;
      }, (error) => {
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
  }

  remove_search_entry(id, event) {
    event.stopPropagation();
    this.utilityMethods.show_loader('');
    this.searchService.remove_search_id(id)
      .subscribe((response) => {
        // console.log(response);
        for (var i = 0; i < this.searches.length; i++) {
          if (this.searches[i].id == id) {
            this.searches.splice(i, 1);
            break;
          }
        }
        this.utilityMethods.hide_loader();
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
  }

  loadNotifications() {
    var user_id = this.authService.getUser().id;
    // if (this.notificationService.loaded_once()) {
    //   var data = this.notificationService.get_notification_data();
    //   this._unread = data.unread;
    // } else {
    this.notificationService.get_notifications(user_id)
      .subscribe((response) => {
        this._unread = response.data.unread;
      }, (error) => {
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
    // }
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

  openSearchPopup(data) {
    let searchModal = this.modalCtrl.create(Search, data);
    searchModal.onDidDismiss(data => {
    });
    searchModal.present();
  }

  presentMeOptionsModal(event) {
    event.stopPropagation();
    let self = this;
    let meOptionsModal = this.modalCtrl.create(MeOptions, null);
    meOptionsModal.onDidDismiss(data => {
      // console.log(data);
      if (data == 'settings') {
        this.presentSettingsModal();
      }
    });
    meOptionsModal.present();
  }

  presentSettingsModal() {
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
            self.notificationService.clear_data();
            self.appCtrl.getRootNav().setRoot(FrontViewPage);
          }, (error) => {
            this.utilityMethods.hide_loader();
            this.utilityMethods.message_alert('Error', 'Logout operation failed, please try again or later.');
            self.authService.clear_user();
            if (error.code == -1) {
              this.utilityMethods.internet_connection_error();
            }
          });
      }
    });
    settingsModal.present();
  }
}
