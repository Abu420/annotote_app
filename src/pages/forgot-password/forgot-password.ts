import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Home } from '../home/home';
import { PasswordForgot } from '../../models/forgot_password';
import { StatusBar } from '@ionic-native/status-bar';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods'

@IonicPage()
@Component({
  selector: 'page-forgotpassword',
  templateUrl: 'forgot-password.html',
})
export class ForgotPassword {

  /**
   * Variables && Configs
   */
  public passwordForgot: PasswordForgot;
  public focus_field: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods) {
    // set status bar to green
    this.statusBar.backgroundColorByHexString('000000');
    this.focus_field = '';
    this.passwordForgot = new PasswordForgot("", "", "");
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

  value_updating_old_password(value) {
    this.passwordForgot.old_password = value;
  }

  value_updating_new_password(value) {
    this.passwordForgot.new_password = value;
  }

  value_updating_con_password(value) {
    this.passwordForgot.confirm_password = value;
  }

  changeColor(field) {
    this.focus_field = field;
  }

  go_home() {
    this.navCtrl.push(Home, {});
  }

}
