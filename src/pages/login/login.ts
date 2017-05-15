import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Home } from '../home/home';
import { StatusBar } from '@ionic-native/status-bar';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods'

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {

  constructor(public navCtrl: NavController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods) {
    // set status bar to green
    this.statusBar.backgroundColorByHexString('000000');
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Login');
  }

  popView() {
    this.navCtrl.pop();
  }

  go_home() {
    this.navCtrl.push(Home, {});
  }

}
