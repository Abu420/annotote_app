import { Component } from '@angular/core';

import { Login } from '../login/login';
import { Signup } from '../signup/signup';
import { NavController, NavParams, ToastController, Toast } from 'ionic-angular';
import { AnototeList } from '../anotote-list/anotote-list';
import { StatusBar } from '@ionic-native/status-bar';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods'

@Component({
      selector: 'page-front-view',
      templateUrl: 'front-view.html',
      providers: [UtilityMethods]
})
export class FrontViewPage {
      public toast: Toast;
      public showFabButton: boolean;
      constructor(public navCtrl: NavController, public statusBar: StatusBar, public utilityMethods: UtilityMethods, private toastCtrl: ToastController) {
            this.showFabButton = true;
      }

      /**
       * View Events
       */
      ionViewDidLoad() {
            this.statusBar.backgroundColorByHexString('000000');
      }

      open_annotote_site() {
            this.utilityMethods.launch('https://annotote.wordpress.com');
      }

      login() {
            this.navCtrl.push(Login, {});
      }

      signup() {
            this.navCtrl.push(Signup, {});
      }

      openAnototeList(event) {
            // this.navCtrl.push(AnototeList, {});
            this.showFabButton = false;
            this.presentToast();
      }

      presentToast() {
            if (this.toast != null) {
                  this.toast.dismiss();
            }
            this.toast = this.toastCtrl.create({
                  message: 'Register or sign in',
                  position: 'bottom',
                  dismissOnPageChange: true,
                  showCloseButton: false,
                  duration: 1000,
                  cssClass: 'bottom_snakbar'
            });

            this.toast.onDidDismiss(() => {
                  this.showFabButton = true;
            });

            this.toast.present();
      }
}
