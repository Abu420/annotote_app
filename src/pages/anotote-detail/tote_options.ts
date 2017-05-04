import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController , NavParams } from 'ionic-angular';
@Component({
  selector: 'anotote_options',
  templateUrl: 'tote_options.html',
})
export class AnototeOptions {

 constructor(params: NavParams,public viewCtrl: ViewController) {
   console.log('UserId', params.get('userId'));
 }

  dismiss() {
   let data = { 'foo': 'bar' };
   this.viewCtrl.dismiss(data);
 }

}