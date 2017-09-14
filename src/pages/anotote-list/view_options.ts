import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, ModalController } from 'ionic-angular';
import { NotificationService } from '../../services/notifications.service';
import { Notifications } from '../notifications/notifications';

@Component({
  selector: 'view_options',
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
  templateUrl: 'view_options.html',
})
export class ViewOptions {
  private un_read: Number;
  private show: boolean = true;
  private anotote: any;
  private stream: any;

  constructor(public modalCtrl: ModalController, public notificationService: NotificationService, params: NavParams, public viewCtrl: ViewController) {
    this.anotote = params.get('anotote');
    var data = this.notificationService.get_notification_data();
    this.un_read = data.unread;
    this.stream = params.get('stream');
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
    this.show = false;
    setTimeout(() => {
      let data = { 'foo': 'bar' };
      this.viewCtrl.dismiss(data);
    }, 100)
  }

}