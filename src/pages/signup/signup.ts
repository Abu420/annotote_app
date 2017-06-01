import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Home } from '../home/home';
import { User } from '../../models/user';
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

  /**
   * Variables && Configs
   */
  public user: User;
  public focus_field: string;

  /**
   * Constructor
   */
  constructor(public navCtrl: NavController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods) {
    this.statusBar.backgroundColorByHexString('000000');
    this.focus_field = '';
    this.user = new User("", "", "", "", "");
  }

  /**
   * View LifeCycle Events
   */
  ionViewDidLoad() {
  }

  ionViewWillLeave() {
  }

  /**
   * General && Utility Methods 
   */

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  popView() {
    this.navCtrl.pop();
  }

  go_home() {
    this.navCtrl.push(Home, {});
  }

  value_updating_email(value) {
    this.user.email = value;
  }

  value_updating_full_name(value) {
    this.user.full_name = value;
  }

  value_updating_password(value) {
    this.user.password = value;
    console.log(this.user)
  }

  changeColor(field) {
    this.focus_field = field;
  }

}
