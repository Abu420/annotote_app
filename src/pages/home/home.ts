import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Follows } from '../follows/follows';
import { Notifications } from '../notifications/notifications';
import { Settings } from '../home/settings';
import { TopInterests } from '../home/top_interests';
import { TopOptions } from '../home/top_options';
import { AnototeList } from '../anotote-list/anotote-list';
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

  presentTopOptionsModal() {
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

  openAnototeList() {
    this.navCtrl.push(AnototeList, {});
  }

  presentSettingsModal(event) {
    event.stopPropagation();
    let settingsModal = this.modalCtrl.create(Settings, null);
    settingsModal.present();
  }

}
