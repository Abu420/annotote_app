import { Component, trigger, transition, style, animate, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { Profile } from '../follows/follows_profile';
import { Chat } from '../chat/chat';
/**
 * Services
 */
import { Constants } from '../../services/constants.service';
import { UtilityMethods } from '../../services/utility_methods';
import { NotificationService } from '../../services/notifications.service';
import { SearchService } from '../../services/search.service';
import { AuthenticationService } from '../../services/auth.service';
import { User } from "../../models/user";

/**
 * Generated class for the Notifications page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-notifications',
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
  templateUrl: 'notifications.html',
})
export class Notifications {

  private _notifications: any;
  private _loading: boolean;
  private _unread: number;
  private image_base_path: string;
  private _reload: boolean;
  private user: User;
  public has_notifications: boolean = true;
  public show: boolean = true;
  public loadMore: boolean = true;

  constructor(public params: NavParams, public constants: Constants, public navCtrl: NavController, public viewCtrl: ViewController, public searchService: SearchService, public utilityMethods: UtilityMethods, public navParams: NavParams, public authService: AuthenticationService, public notificationService: NotificationService, public modalCtrl: ModalController) {
    this._notifications = [];
    this._loading = false;
    this._unread = 0;
    this.image_base_path = this.constants.IMAGE_BASEURL;
    this.user = this.authService.getUser();
    this._reload = this.params.get('reload');
  }

  ionViewDidLoad() {
    this._loading = false;
    this.loadNotifications();
  }

  dismiss(action) {
    this.show = false;
    setTimeout(() => {
      this.viewCtrl.dismiss();
    }, 300)
  }

  read_notification(notification) {
    var params = {
      sender_id: notification.senderId,
      type: notification.type
    }
    this.notificationService.read_notificaton(params)
      .subscribe((response) => {
        notification.readStatus = 1;
        this._unread = this.notificationService.decrement_notification();
      }, (error) => {
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
  }

  read_or_unread(notification) {
    console.log(notification);
    if (notification.readStatus == 0) {
      this.read_notification(notification);
    } else {
      this.unread_notification(notification);
    }
  }

  go_to_thread(notification) {
    if (notification.readStatus == 0) {
      this.read_notification(notification);
    }
    if (notification.type != 'user:message')
      this.showProfile(notification.sender.id);
    else if (notification.type == 'user:message')
      this.go_to_chat_thread(notification.sender);
  }

  unread_notification(notification) {
    var params = {
      notification_id: notification.id
    }
    this.notificationService.unreadNotifications(params).subscribe(() => {
      notification.readStatus = 0;
      this._unread = this.notificationService.increment_notification();
    }, () => {

    })
  }

  go_to_chat_thread(user) {
    this.navCtrl.push(Chat, { secondUser: user });
  }

  showProfile(user_id) {
    var toast = this.utilityMethods.doLoadingToast('Please wait...');
    this.searchService.get_user_profile_info(user_id)
      .subscribe((response) => {
        toast.dismiss();
        this.presentProfileModal(response);
      }, (error) => {
        toast.dismiss();
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

  loadNotifications() {
    if (this.notificationService.loaded_once()) {
      var data = this.notificationService.get_notification_data();
      this._notifications = data.notifications;
      this._unread = data.unread;
      this._loading = true;
      if (this._notifications.length == 0) {
        this.has_notifications = false;
        this.loadMore = false;
      } else if (this._notifications.length < 10) {
        this.loadMore = false;
      }
    } else {
      // this.notificationService.get_notifications(user_id)
      //   .subscribe((response) => {
      //     this._loading = true;
      //     var data = this.notificationService.get_notification_data();
      //     this._notifications = data.notifications;
      //     this._unread = data.unread;
      //     console.log(data)
      //   }, (error) => {
      //     this._loading = true;
      //     if (error.code == -1) {
      //       this.utilityMethods.internet_connection_error();
      //     }
      //   });
    }
  }

  doInfinite(infinte) {
    this.notificationService.get_notifications(this.user.id)
      .subscribe((response) => {
        this._loading = true;
        // var data = this.notificationService.get_notification_data();
        // this._notifications = data.notifications;
        // this._unread = data.unread;
        infinte.complete();
        if (response.data.notifications.length < 10) {
          infinte.enable(false);
          this.loadMore = false;
        }
      }, (error) => {
        this._loading = true;
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
  }

}
