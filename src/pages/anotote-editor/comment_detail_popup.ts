import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
@Component({
  selector: 'comment_detail_popup',
  templateUrl: 'comment_detail_popup.html',
})
export class CommentDetailPopup {
  private anotote_txt: string;

  constructor(public params: NavParams, public viewCtrl: ViewController) {
    this.anotote_txt = this.params.get('txt');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  delete() {
    this.viewCtrl.dismiss({ delete: true });
  }

  share() {
    this.viewCtrl.dismiss({ share: true });
  }

  presentTopInterestsModal() {
    this.viewCtrl.dismiss();
  }

}