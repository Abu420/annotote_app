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
  selector: 'page-changepassword',
  templateUrl: 'change-password.html',
})
export class ChangePassword {

  /**
   * Variables && Configs
   */
  public forgot_password_old: string;
  public forgot_password_new: string;
  public forgot_password_confirm: string;
  public forgot_password_old_error: boolean;
  public forgot_password_new_error: boolean;
  public forgot_password_confirm_error: boolean;
  public focus_field: string;

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods, public authService: AuthenticationService, public keyboard: Keyboard) {
    // set status bar to green
    this.statusBar.backgroundColorByHexString('000000');
    this.focus_field = '';
    this.forgot_password_old = '';
    this.forgot_password_new = '';
    this.forgot_password_confirm = '';
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() { }

  popView() {
    this.navCtrl.pop();
  }

  value_updating_old(value) {
    this.forgot_password_old = value;
  }

  value_updating_new(value) {
    this.forgot_password_new = value;
  }

  value_updating_confirm(value) {
    this.forgot_password_confirm = value;
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
    this.forgot_password_old_error = false;
    this.forgot_password_new_error = false;
    this.forgot_password_confirm_error = false;
    if (_.isEmpty(this.forgot_password_old)) {
      _error = true;
      this.forgot_password_old_error = true;
    }
    if (_.isEmpty(this.forgot_password_new)) {
      _error = true;
      this.forgot_password_new_error = true;
    }
    if (_.isEmpty(this.forgot_password_confirm)) {
      _error = true;
      this.forgot_password_confirm_error = true;
    }
    if (this.forgot_password_confirm != this.forgot_password_new) {
      _error = true;
      this.forgot_password_confirm_error = true;
    }
    if (_error) {
      return;
    }

    /**
     * API call, after Successfull validation
     */
    var current_time = (new Date()).getTime() / 1000,
      platform_name = this.platform.is('ios') ? 'ios' : 'android';
    this.utilityMethods.show_loader('Please wait...');
    this.authService.reset_password({
      old_password: this.forgot_password_old,
      new_password: this.forgot_password_new
    }).subscribe((response) => {
      let self = this;
      this.utilityMethods.hide_loader();
      this.utilityMethods.message_alert_with_callback('Reset Password', 'Password has been changed successfully.', function () {
        self.navCtrl.pop();
      });
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      } else
        this.utilityMethods.message_alert('Error', 'Invalid old password, please enter correct password.');
    });
  }

}
