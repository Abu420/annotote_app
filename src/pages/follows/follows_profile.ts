import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
@Component({
  selector: 'follow_profile',
  templateUrl: 'follows_profile.html',
})
export class Profile {

  public profileData: any;

  constructor(params: NavParams, public viewCtrl: ViewController) {
    this.profileData = params.get('data');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}