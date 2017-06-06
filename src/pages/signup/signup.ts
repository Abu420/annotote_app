import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Home } from '../home/home';
import { User } from '../../models/user';
import * as _ from 'underscore/underscore';
import { StatusBar } from '@ionic-native/status-bar';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { AuthenticationService } from '../../services/auth.service';


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
  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods, public authService: AuthenticationService) {
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
    if (_.isEmpty(this.user.firstName)) {
      _error = true;
    }
    if (_.isEmpty(this.user.lastName)) {
      _error = true;
    }
    if (_error) {
      this.utilityMethods.message_alert('Error', 'Please enter complete details to register.');
      return;
    }

    /**
     * API call, after Successfull validation
     */
    let self = this;
    var current_time = (new Date()).getTime() / 1000;
    this.utilityMethods.show_loader('Please wait...');
    this.authService.register({
      email: this.user.email,
      first_name: this.user.firstName,
      last_name: this.user.lastName,
      platform: 'web',
      platform_id: null,
      password: this.user.password,
      created_at: current_time
    }).subscribe((response) => {
      self.utilityMethods.hide_loader();
      self.utilityMethods.message_alert_with_callback('Registration', 'You have successfully registered. We have sent you a verification email.', function () {
        self.navCtrl.pop();
      });
    }, (error) => {
      self.utilityMethods.hide_loader();
      if (error.status == 400)
        self.utilityMethods.message_alert('Error', 'This email has already been taken.');
    });
  }

  value_updating_email(value) {
    this.user.email = value;
  }

  value_updating_first_name(value) {
    this.user.firstName = value;
  }

  value_updating_last_name(value) {
    this.user.lastName = value;
  }

  value_updating_password(value) {
    this.user.password = value;
  }

  changeColor(field) {
    this.focus_field = field;
  }

}
