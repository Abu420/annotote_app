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
import { ChatToteOptions } from '../anotote-list/chat_tote';
import { Chat } from '../chat/chat';
import { AnototeEditor } from '../anotote-editor/anotote-editor';
import { Streams } from '../../services/stream.service';
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

  constructor(public platform: Platform, private events: Events, public searchService: SearchService, public notificationService: NotificationService, public appCtrl: App, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public authService: AuthenticationService, public statusBar: StatusBar, public stream: Streams) {
    this._unread = 0;
    this.searches = [];
    this.latest_searches_firstTime_loading = true;
  }

  /**
   * View Events
   */
  ionViewDidLoad() {
    // this.events.subscribe('new_search_added', (data) => {
    //   this.searches.splice(0, 0, data.entry);
    // });
  }

  ionViewDidLeave() {
    // this.events.unsubscribe('new_search_added');
  }

  mySwipeUpAction() {
    // console.log('left')
  }

  mySwipeDownAction() {

  }

  ionViewDidEnter() {
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

  //changed flow, if clicked on saved search it should scrap that url
  open_this_search(search) {
    if (this.utilityMethods.isWEBURL(search.term)) {
      this.scrape_this_url(search);
    } else {
      this.openSearchPopup({ saved_searched_txt: search.term });
    }
  }

  scrape_this_url(search) {
    var current_time = this.utilityMethods.get_php_wala_time();
    this.utilityMethods.show_loader('');
    this.searchService.create_anotote({ url: search.term, created_at: current_time })
      .subscribe((response) => {
        this.utilityMethods.hide_loader();
        this.navCtrl.push(AnototeEditor, { ANOTOTE: response.data, FROM: 'search', WHICH_STREAM: 'anon', actual_stream: 'anon', search_to_delete: search });
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.status == 500) {
          this.utilityMethods.message_alert("Ooops", "Couldn't scrape this url.");
        } else if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
  }

  get_search_entries() {
    if (this.searchService.saved_searches.length > 0) {
      this.searches = this.searchService.saved_searches;
    } else {
      this.searchService.get_search_entries()
        .subscribe((response) => {
          this.latest_searches_firstTime_loading = false;
          this.searchService.saved_searches = response.data.searches;
          this.searches = response.data.searches;
        }, (error) => {
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          }
        });
    }
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
    if (this.notificationService.loaded_once()) {
      var data = this.notificationService.get_notification_data();
      this._unread = data.unread;
    } else {
      this.notificationService.get_notifications(user_id)
        .subscribe((response) => {
          this._unread = response.data.unread;
        }, (error) => {
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          }
        });
    }
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
    if (!data)
      data = {}
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
            self.stream.clear();
            self.searchService.saved_searches = [];
            self.notificationService.clear_data();
            self.appCtrl.getRootNav().setRoot(FrontViewPage);
            this.notificationService._loaded_once_flag = false;
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

  addBtn() {
    var params = {
      anotote: null,
      stream: 'homeheader'
    }
    let chatTote = this.modalCtrl.create(ChatToteOptions, params);
    chatTote.onDidDismiss((data) => {
      if (data.chat) {
        this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: false, anotote_id: null, title: '' });
      }
    })
    chatTote.present();
  }
}
