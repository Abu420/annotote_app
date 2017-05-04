import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController , NavParams } from 'ionic-angular';
@Component({
  selector: 'home_settings',
  templateUrl: 'settings.html',
})
export class Settings {

 constructor(params: NavParams,public viewCtrl: ViewController) {
   console.log('UserId', params.get('userId'));
 }

  dismiss() {
   let data = { 'foo': 'bar' };
   this.viewCtrl.dismiss(data);
 }

}