import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController , NavParams } from 'ionic-angular';
@Component({
  selector: 'comment_detail_popup',
  templateUrl: 'comment_detail_popup.html',
})
export class CommentDetailPopup {

 constructor(public params: NavParams,public viewCtrl: ViewController) {
 }

  dismiss() {
   let data = { 'foo': 'bar' };
   this.viewCtrl.dismiss(data);
 }

 presentTopInterestsModal() {
   this.viewCtrl.dismiss('interests');
 }

}