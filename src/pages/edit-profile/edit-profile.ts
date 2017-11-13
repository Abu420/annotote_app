import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Keyboard } from 'ionic-angular';
import { Home } from '../home/home';
import * as _ from 'underscore/underscore';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { AuthenticationService } from '../../services/auth.service';

@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfile {

  /**
   * Variables && Configs
   */
  public user = {
    firstName: '',
    lastName: '',
    email: '',
    description: ''
  };
  public field_error = {
    first_name: false,
    last_name: false,
    email: false,
    description: false
  };
  public focus_field: string;

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public utilityMethods: UtilityMethods, public authService: AuthenticationService, public keyboard: Keyboard) {
    // // set status bar to green
    // this.statusBar.backgroundColorByHexString('000000');
    this.focus_field = '';
    var user = this.authService.getUser();
    this.user.firstName = user.firstName;
    this.user.lastName = user.lastName;
    this.user.description = user.description ? user.description : '';
    this.user.email = user.email;
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() {
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
    if (_.isEmpty(this.user.firstName)) {
      _error = true;
      this.field_error.first_name = true;
    }
    // if (_.isEmpty(this.user.lastName)) {
    //   _error = true;
    //   this.field_error.last_name = true;
    // }
    if (_error) {
      // this.utilityMethods.message_alert('Error', 'Please enter complete details to register.');
      return;
    }

    /**
     * API call, after Successfull validation
     */
    var toast = this.utilityMethods.doLoadingToast('Editing');
    this.authService.update_profile({
      email: this.user.email,
      first_name: this.user.firstName,
      last_name: this.user.lastName,
      description: this.user.description,
      updated_at: this.utilityMethods.get_php_wala_time()
    }).subscribe((response) => {
      toast.dismiss();
      this.authService.updateUser(response.data.user);
      this.utilityMethods.doToast('Profile updated successfully.');
      this.navCtrl.pop();
    }, (error) => {
      toast.dismiss();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      } else
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
    }
  }

}
