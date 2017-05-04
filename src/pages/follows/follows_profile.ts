import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController , NavParams } from 'ionic-angular';
@Component({
  selector: 'follow_profile',
  templateUrl: 'follows_profile.html',
})
export class Profile {

 constructor(params: NavParams,public viewCtrl: ViewController) {
   console.log('UserId', params.get('userId'));
 }

  dismiss() {
   let data = { 'foo': 'bar' };
   this.viewCtrl.dismiss(data);
 }

}