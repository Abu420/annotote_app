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
  private which_stream: string;

  constructor(public params: NavParams, public viewCtrl: ViewController) {
    this.anotote_txt = this.params.get('txt');
    this.anotote_identifier = this.params.get('identifier');
    this.anotote_type = this.params.get('type');
    this.anotote_comment = this.params.get('comment');
    this.which_stream = this.params.get('which_stream');
    console.log(this.params.get('comment'))
  }

  dismiss() {
    this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '' });
  }

  delete() {
    this.viewCtrl.dismiss({ delete: true, share: false, update: false, comment: '' });
  }

  share() {
    var share_txt = this.anotote_txt;
    this.viewCtrl.dismiss({ share: true, delete: false, update: false, comment: share_txt });
  }

  update_comment() {
    console.log(this.anotote_comment);
    this.viewCtrl.dismiss({ share: true, delete: false, update: true, comment: this.anotote_comment });
  }

  doTextareaValueChange(ev) {
    try {
      this.anotote_comment = ev.target.value;
    } catch (e) {
      console.info('could not set textarea-value');
    }
  }

  presentTopInterestsModal() {
    this.viewCtrl.dismiss();
  }

}