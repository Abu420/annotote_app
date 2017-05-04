import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Follows } from '../follows/follows';
import { Notifications } from '../notifications/notifications';
import { Settings } from '../home/settings';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Home');
  }

  notifications() {
    this.navCtrl.push(Notifications, {});
  }

  follows() {
    this.navCtrl.push(Follows, {});
  }

   presentSettingsModal() {
     let settingsModal = this.modalCtrl.create(Settings, { userId: 8675309 });
     settingsModal.present();
  }

}
