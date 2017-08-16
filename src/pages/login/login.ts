import { Component, ViewChild } from '@angular/core';
import { IonicPage, App, NavController, NavParams, Platform, Keyboard } from 'ionic-angular';
import { Home } from '../home/home';
import { ForgotPassword } from '../forgot-password/forgot-password';
import { User } from '../../models/user';
import { StatusBar } from '@ionic-native/status-bar';
import * as _ from 'underscore/underscore';
import { Storage } from '@ionic/storage';
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
  public device_id: string;
  public field_error = {
    email: false,
    password: false
  };

  /**
   * Constructor
   */

  constructor(private appCtrl: App, public platform: Platform, public navCtrl: NavController, public storage: Storage, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods, public authService: AuthenticationService, public keyboard: Keyboard) {
    // set status bar to green
    // this.statusBar.backgroundColorByHexString('000000');
    this.focus_field = '';
    this.user = new User("", "", "", "", "");
    this.device_id = localStorage.getItem('device_id');
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

  go_back(ev) {
    //console.log("DIRECTION " + ev.direction);
  }

  popView() {
    this.navCtrl.pop();
  }

  open_forgot_password() {
    this.navCtrl.push(ForgotPassword, {});
  }

  changeColor(field) {
    this.focus_field = field;
    if (field != '') {
      if (field == 'email')
        this.field_error.email = false;
      else if (field == 'password')
        this.field_error.password = false;
    }
  }

  go_home() {
    this.keyboard.close();
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
    if (_error) {
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
      device_id: this.device_id ? this.device_id : 123456
    }).subscribe((response) => {
      this.utilityMethods.hide_loader();
      response.data.user.access_token = response.access_token;
      this.authService.setUser(response.data.user);
      this.appCtrl.getRootNav().setRoot(Home);
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1 || error.code == -2) {
        this.utilityMethods.internet_connection_error();
      } else if (error.status == 404)
        this.utilityMethods.message_alert('Error', 'Invalid email or password.');
      else if (error.status == 400)
        this.utilityMethods.message_alert('Error', 'Your account is not verified. Verification email has already been sent.');
    });
  }

}
