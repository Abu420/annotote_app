import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Keyboard } from 'ionic-angular';
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
  public field_error = {
    first_name: false,
    last_name: false,
    email: false,
    password: false
  };
  public focus_field: string;

  /**
   * Constructor
   */
  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods, public authService: AuthenticationService, public keyboard: Keyboard) {
    // this.statusBar.backgroundColorByHexString('000000');
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
    this.keyboard.close();
    if (this.utilityMethods.isOffline()) {
      this.utilityMethods.internet_connection_error();
      return;
    }
    /**
     * Validate User first
     */
    var _error = false;
    if (_.isEmpty(this.user.email) || !this.utilityMethods.validate_email(this.user.email)) {
      _error = true;
      this.field_error.email = true;
    }
    if (_.isEmpty(this.user.password)) {
      _error = true;
      this.field_error.password = true;
    }
    if (_.isEmpty(this.user.firstName)) {
      _error = true;
      this.field_error.first_name = true;
    }
    if (_.isEmpty(this.user.lastName)) {
      _error = true;
      this.field_error.last_name = true;
    }
    if (_error) {
      // this.utilityMethods.message_alert('Error', 'Please enter complete details to register.');
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
      this.utilityMethods.hide_loader();
      this.utilityMethods.message_alert_with_callback('Registration', 'You have successfully registered. We have sent you a verification email.', () => {
        this.navCtrl.pop();
      });
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      } else if (error.status == 400)
        this.utilityMethods.message_alert('Error', 'This email has already been taken.');
    });
  }

  changeColor(field) {
    this.focus_field = field;
    if (field != '') {
      if (field == 'email')
        this.field_error.email = false;
      else if (field == 'first_name')
        this.field_error.first_name = false;
      else if (field == 'last_name')
        this.field_error.last_name = false;
      else if (field == 'password')
        this.field_error.password = false;
    }
  }

}
