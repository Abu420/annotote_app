import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Home } from '../home/home';
import { ForgotPassword } from '../forgot-password/forgot-password';
import { User } from '../../models/user';
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

  /**
   * Variables && Configs
   */
  public user: User;
  public focus_field: string;

  /**
   * Constructor
   */

  constructor(public navCtrl: NavController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods) {
    // set status bar to green
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

  value_updating_email(value) {
    this.user.email = value;
  }

  value_updating_password(value) {
    this.user.password = value;
    console.log(this.user)
  }

  open_forgot_password() {
    this.navCtrl.push(ForgotPassword, {});
  }

  changeColor(field) {
    this.focus_field = field;
  }

  go_home() {
    this.navCtrl.push(Home, {});
  }

}
