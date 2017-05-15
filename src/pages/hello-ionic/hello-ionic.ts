import { Component } from '@angular/core';

import { Login } from '../login/login';
import { Signup } from '../signup/signup';
import { NavController, NavParams } from 'ionic-angular';
import { AnototeList } from '../anotote-list/anotote-list';
import { StatusBar } from '@ionic-native/status-bar';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods'

@Component({
      selector: 'page-hello-ionic',
      templateUrl: 'hello-ionic.html',
      providers: [UtilityMethods]
})
export class HelloIonicPage {
      constructor(public navCtrl: NavController, public statusBar: StatusBar, public utilityMethods: UtilityMethods) {
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
            this.navCtrl.push(AnototeList, {});
      }
}
