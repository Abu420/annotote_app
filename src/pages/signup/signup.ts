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
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class Signup {

  constructor(public navCtrl: NavController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods) {
    this.statusBar.backgroundColorByHexString('000000');
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Signup');
  }

  popView() {
    this.navCtrl.pop();
  }

  go_home() {
    this.navCtrl.push(Home, {});
  }

}
