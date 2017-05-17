import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController , NavParams } from 'ionic-angular';
@Component({
  selector: 'view_options',
  templateUrl: 'view_options.html',
})
export class ViewOptions {

 constructor(params: NavParams,public viewCtrl: ViewController) {
   console.log('UserId', params.get('userId'));
 }

  dismiss() {
   let data = { 'foo': 'bar' };
   this.viewCtrl.dismiss(data);
 }

}