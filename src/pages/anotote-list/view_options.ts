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

  constructor(public modalCtrl: ModalController, public notificationService: NotificationService, params: NavParams, public viewCtrl: ViewController) {
    console.log('UserId', params.get('userId'));
    var data = this.notificationService.get_notification_data();
    this.un_read = data.unread;
  }

  show_notifications() {
    this.dismiss();
    let notifications = this.modalCtrl.create(Notifications, null);
    notifications.present();
  }

  dismiss() {
    let data = { 'foo': 'bar' };
    this.viewCtrl.dismiss(data);
  }

}