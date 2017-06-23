import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { Profile } from '../follows/follows_profile';
import { Chat } from '../chat/chat';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { NotificationService } from '../../services/notifications.service';
import { SearchService } from '../../services/search.service';
import { AuthenticationService } from '../../services/auth.service';

/**
 * Generated class for the Notifications page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class Notifications {

  private _notifications: any;
  private _loading: boolean;
  private _unread: number;
  private _reload: boolean;

  constructor(public params: NavParams, public navCtrl: NavController, public viewCtrl: ViewController, public searchService: SearchService, public utilityMethods: UtilityMethods, public navParams: NavParams, public authService: AuthenticationService, public notificationService: NotificationService, public modalCtrl: ModalController) {
    this._notifications = [];
    this._loading = false;
    this._unread = 0;

    this._reload = this.params.get('reload');
  }

  ionViewDidLoad() {
    this._loading = false;
    this.loadNotifications();
  }

  read_notification(notification) {
    this.notificationService.read_notificaton(notification.id)
      .subscribe((response) => {
        notification.readStatus = 1;
        this._unread = this.notificationService.decrement_notification();
      });
    if (notification.type != 'user:message')
      this.showProfile(notification.sender.id);
    else if (notification.type == 'user:message')
      this.go_to_chat_thread(notification);
  }

  go_to_chat_thread(user) {
    this.navCtrl.push(Chat, { secondUser: user });
  }

  showProfile(user_id) {
    this.utilityMethods.show_loader('Please wait...');
    this.searchService.get_user_profile_info(user_id)
      .subscribe((response) => {
        this.utilityMethods.hide_loader();
        this.presentProfileModal(response);
      }, (error) => {
        this.utilityMethods.hide_loader();
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


  loadNotifications() {
    var user_id = this.authService.getUser().id;
    if (this.notificationService.loaded_once() && (this._reload == null || this._reload == undefined)) {
      var data = this.notificationService.get_notification_data();
      this._notifications = data.notifications;
      this._unread = data.unread;
      this._loading = true;
    } else {
      this.notificationService.get_notifications(user_id)
        .subscribe((response) => {
          this._loading = true;
          var data = this.notificationService.get_notification_data();
          this._notifications = data.notifications;
          this._unread = data.unread;
        }, (error) => {
          this._loading = true;
        });
    }
  }

}
