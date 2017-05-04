import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController , NavParams } from 'ionic-angular';
@Component({
  selector: 'top_interests',
  templateUrl: 'top_interests.html',
})
export class TopInterests {

 constructor(params: NavParams,public viewCtrl: ViewController) {
   console.log('UserId', params.get('userId'));
 }

  dismiss() {
   let data = { 'foo': 'bar' };
   this.viewCtrl.dismiss(data);
 }

}