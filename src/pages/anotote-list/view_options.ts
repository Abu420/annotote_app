import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, ModalController } from 'ionic-angular';
import { NotificationService } from '../../services/notifications.service';
import { Notifications } from '../notifications/notifications';

@Component({
  selector: 'view_options',
  templateUrl: 'view_options.html',
})
export class ViewOptions {
  private un_read: Number;
  private anotote: any;
  private stream: any;

  constructor(public modalCtrl: ModalController, public notificationService: NotificationService, params: NavParams, public viewCtrl: ViewController) {
    this.anotote = params.get('anotote');
    var data = this.notificationService.get_notification_data();
    this.un_read = data.unread;
    this.stream = params.get('stream');
    console.log(this.stream);
  }

  show_notifications() {
    this.dismiss();
    let notifications = this.modalCtrl.create(Notifications, null);
    notifications.present();
  }

  change_tab(preference) {
    if (preference == 'me') {
      // this.anotote.active_tab = 'me';
      var params = {
        tab_selected: 'me'
      }
      this.viewCtrl.dismiss(params);
    } else if (preference == 'follows') {
      // this.anotote.active_tab = 'follows';
      var params = {
        tab_selected: 'follows'
      }
      this.viewCtrl.dismiss(params);
    } else {
      // this.anotote.active_tab = 'top';
      var params = {
        tab_selected: 'top'
      }
      this.viewCtrl.dismiss(params);
    }
  }

  dismiss() {
    let data = { 'foo': 'bar' };
    this.viewCtrl.dismiss(data);
  }

}