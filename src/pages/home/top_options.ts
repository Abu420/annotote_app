import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController , NavParams } from 'ionic-angular';
@Component({
  selector: 'top_options',
  templateUrl: 'top_options.html',
})
export class TopOptions {

 constructor(public params: NavParams, public viewCtrl: ViewController) {
 }

 dismiss() {
   let data = { 'foo': 'bar' };
   this.viewCtrl.dismiss(data);
 }

 presentTopInterestsModal() {
   this.viewCtrl.dismiss('interests');
 }

}