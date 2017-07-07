import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
@Component({
  selector: 'comment_detail_popup',
  templateUrl: 'comment_detail_popup.html',
})
export class CommentDetailPopup {
  private anotote_txt: string;
  private anotote_type: string;
  private anotote_identifier: string;
  private anotote_comment: string;

  constructor(public params: NavParams, public viewCtrl: ViewController) {
    this.anotote_txt = this.params.get('txt');
    this.anotote_identifier = this.params.get('identifier');
    this.anotote_type = this.params.get('type');
    this.anotote_comment = this.params.get('comment');
    console.log(this.params.get('comment'))
  }

  dismiss() {
    this.viewCtrl.dismiss({ delete: false, share: false });
  }

  delete() {
    this.viewCtrl.dismiss({ delete: true, share: false });
  }

  share() {
    this.viewCtrl.dismiss({ share: true, delete: false });
  }

  presentTopInterestsModal() {
    this.viewCtrl.dismiss();
  }

}