import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Home } from '../home/home';
import { ForgotPassword } from '../forgot-password/forgot-password';
import { User } from '../../models/user';
import { StatusBar } from '@ionic-native/status-bar';
import * as _ from 'underscore/underscore';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { AuthenticationService } from '../../services/auth.service';

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

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods, public authService: AuthenticationService) {
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
  }

  open_forgot_password() {
    this.navCtrl.push(ForgotPassword, {});
  }

  changeColor(field) {
    this.focus_field = field;
  }

  go_home() {
    /**
     * Validate User first
     */
    var _error = false;
    if (_.isEmpty(this.user.email) || !this.utilityMethods.validate_email(this.user.email)) {
      _error = true;
    }
    if (_.isEmpty(this.user.password)) {
      _error = true;
    }
    if (_error) {
      this.utilityMethods.message_alert('Error', 'Please enter valid email and password.');
      return;
    }

    /**
     * API call, after Successfull validation
     */
    var current_time = (new Date()).getTime() / 1000,
      platform_name = this.platform.is('ios') ? 'ios' : 'android';
    this.utilityMethods.show_loader('Please wait...');
    this.authService.login({
      email: this.user.email,
      password: this.user.password,
      created_at: current_time,
      device_type: platform_name,
      device_id: '123456'
    }).subscribe((response) => {
      this.utilityMethods.hide_loader();
      console.log(response);
      response.data.user.access_token = response.access_token;
      this.authService.setUser(response.data.user);
      this.navCtrl.push(Home, {});
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.status == 404)
        this.utilityMethods.message_alert('Error', 'Invalid email or password.');
      else if (error.status == 400)
        this.utilityMethods.message_alert('Error', 'Your account is not verified. Verification email has already been sent.');
      else
        this.utilityMethods.message_alert('Error', 'Invalid email or password.');
    });
  }

}
