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
import { AnototeService } from '../../services/anotote.service';
import { SearchUnPinned } from '../../models/search';
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
  public loading_check: boolean = false;
  public loading_message: string = '';
  public move_fab: boolean = false;

  constructor(public platform: Platform,
    private events: Events,
    public searchService: SearchService,
    public notificationService: NotificationService,
    public appCtrl: App,
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public utilityMethods: UtilityMethods,
    public authService: AuthenticationService,
    public statusBar: StatusBar,
    public stream: Streams,
    public anototeService: AnototeService, ) {
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
    this.statusBar.backgroundColorByHexString('#323232');
    this.loadNotifications();
    this.get_search_entries();
  }

  showLoading(message) {
    this.loading_message = message;
    this.loading_check = true;
    this.move_fab = true;
    // this.content.resize();
  }

  hideLoading() {
    this.loading_message = '';
    this.loading_check = false;
    this.move_fab = false;
    // this.content.resize();
  }

  toastInFooter(message) {
    this.showLoading(message);
    // this.content.resize();
    setTimeout(() => {
      this.hideLoading();
    }, 2000);
  }

  pinImage(event, search: SearchUnPinned) {
    event.stopPropagation();
    if (search.id == 0 && search.bookMarked == 1 && search.userToteId > 0) {
      var links = [];
      var title = [];
      links.push(search.term);
      title.push(search.linkTitle);
      var params = {
        user_tote_id: search.userToteId,
        user_id: search.userId,
        links: links,
        tote_titles: title,
        created_at: this.utilityMethods.get_php_wala_time()
      }
      this.showLoading("Pinning");
      this.anototeService.bookmark_totes(params).subscribe((result) => {
        this.hideLoading();
        if (result.status == 1) {
          if (result.data.bookmarks.length > 0) {
            this.searchService.saved_searches[this.searchService.saved_searches.indexOf(search)] = result.data.bookmarks[0];
            this.toastInFooter("Pinned");
          } else if (result.data.exist_count == 1) {
            this.toastInFooter("Already Bookmarked");
          }
        }
      }, (error) => {
        this.hideLoading();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      })
    } else if (search.id == 0 && search.userToteId == 0) {
      var paramsObj = {
        created_at: this.utilityMethods.get_php_wala_time(),
        searched_term: search.term,
        title: search.linkTitle,
        book_marked: search.bookMarked
      }
      this.showLoading("Pinning");
      this.searchService.save_search_entry(paramsObj).subscribe((result) => {
        this.hideLoading();
        this.searchService.saved_searches[this.searchService.saved_searches.indexOf(search)] = result.data.search;
        this.toastInFooter("Pinned");
      }, (error) => {
        this.hideLoading();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        } else {
          this.toastInFooter("Couldn't pinn");
        }
      });
    } else {
      this.toastInFooter('Already pinned');
    }
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
    this.showLoading("Loading Tote");
    this.searchService.create_anotote({ url: search.term, created_at: current_time })
      .subscribe((response) => {
        this.hideLoading();
        this.navCtrl.push(AnototeEditor, { ANOTOTE: response.data, FROM: 'search', WHICH_STREAM: 'anon', actual_stream: 'anon', search_to_delete: search });
      }, (error) => {
        this.hideLoading();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        } else {
          this.toastInFooter("Couldn't scrape this url.");
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
    this.showLoading("Removing");
    this.searchService.remove_search_id(id)
      .subscribe((response) => {
        // console.log(response);
        for (var i = 0; i < this.searches.length; i++) {
          if (this.searches[i].id == id) {
            this.searches.splice(i, 1);
            break;
          }
        }
        this.hideLoading();
      }, (error) => {
        this.hideLoading();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        } else {
          this.toastInFooter("Couldn't remove");
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
      } else if (data == 'chat') {
        this.addBtn(true)
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
        this.showLoading("Logging Out");
        this.authService.logout()
          .subscribe((response) => {
            this.hideLoading();
            self.authService.clear_user();
            self.stream.clear();
            self.searchService.saved_searches = [];
            self.notificationService.clear_data();
            self.appCtrl.getRootNav().setRoot(FrontViewPage);
            this.notificationService._loaded_once_flag = false;
          }, (error) => {
            this.hideLoading();
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

  addBtn(check = false) {
    var params: any = {
      anotote: null,
      stream: 'homeheader',
      findChatter: true
    }
    if (check)
      params.findChatter = true;
    let chatTote = this.modalCtrl.create(ChatToteOptions, params);
    chatTote.onDidDismiss((data) => {
      if (data.chat) {
        this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: false, anotote_id: null, title: '' });
      }
    })
    chatTote.present();
  }
}
