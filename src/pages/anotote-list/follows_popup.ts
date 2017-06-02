import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController , NavParams } from 'ionic-angular';
@Component({
  selector: 'follows_popup',
  templateUrl: 'follows_popup.html',
})
export class FollowsPopup {

 constructor(params: NavParams,public viewCtrl: ViewController) {
   console.log('UserId', params.get('userId'));
 }

 choose_this_user() {
   let data = { 'foo': 'bar' };
   this.viewCtrl.dismiss(data); 	
 }

  dismiss() {
   let data = { 'foo': 'bar' };
   this.viewCtrl.dismiss(data);
 }

}