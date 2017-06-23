import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Keyboard } from 'ionic-angular';
import { Home } from '../home/home';
import * as _ from 'underscore/underscore';
import { StatusBar } from '@ionic-native/status-bar';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { AuthenticationService } from '../../services/auth.service';

@IonicPage()
@Component({
  selector: 'page-forgotpassword',
  templateUrl: 'forgot-password.html',
})
export class ForgotPassword {

  /**
   * Variables && Configs
   */
  public forgot_password_email: string;
  public focus_field: string;

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods, public authService: AuthenticationService, public keyboard: Keyboard) {
    // set status bar to green
    this.statusBar.backgroundColorByHexString('000000');
    this.focus_field = '';
    this.forgot_password_email = '';
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() { }

  popView() {
    this.navCtrl.pop();
  }

  value_updating_email(value) {
    this.forgot_password_email = value;
  }

  changeColor(field) {
    this.focus_field = field;
  }

  go_home() {
    this.keyboard.close();
    /**
     * Validate User first
     */
    var _error = false;
    if (_.isEmpty(this.forgot_password_email) || !this.utilityMethods.validate_email(this.forgot_password_email)) {
      _error = true;
    }
    if (_error) {
      this.utilityMethods.message_alert('Error', 'Please enter valid email.');
      return;
    }

    /**
     * API call, after Successfull validation
     */
    var current_time = (new Date()).getTime() / 1000,
      platform_name = this.platform.is('ios') ? 'ios' : 'android';
    this.utilityMethods.show_loader('Please wait...');
    this.authService.forgot_password({
      email: this.forgot_password_email
    }).subscribe((response) => {
      let self = this;
      this.utilityMethods.hide_loader();
      this.utilityMethods.message_alert_with_callback('Forgot Password', 'Link to reset password has been sent via email.', function () {
        self.navCtrl.pop();
      });
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }else if (error.status == 451)
        this.utilityMethods.message_alert('Error', 'Your email is not verified yet.');
      else
        this.utilityMethods.message_alert('Error', 'No account matches to: ' + this.forgot_password_email);
    });
  }

}
