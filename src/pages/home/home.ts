import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Follows } from '../follows/follows';
import { Notifications } from '../notifications/notifications';
import { Settings } from '../home/settings';
import { TopInterests } from '../home/top_interests';
import { TopOptions } from '../home/top_options';
import { AnototeList } from '../anotote-list/anotote-list';
import { FrontViewPage } from '../front-view/front-view';
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

  constructor(public appCtrl: App, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController) {
  }

  /**
   * View Events
   */
  ionViewDidLoad() {
  }

  notifications() {
    // this.navCtrl.push(Notifications, {});
    let notifications = this.modalCtrl.create(Notifications, null);
    notifications.present();
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
    settingsModal.onDidDismiss(data => {
      if (data == 'logout') {
        this.appCtrl.getRootNav().setRoot(FrontViewPage);
      }
    });
    settingsModal.present();
  }

}
