import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
import { UtilityMethods } from '../../services/utility_methods';
@Component({
  selector: 'comment_detail_popup',
  templateUrl: 'comment_detail_popup.html',
})
export class CommentDetailPopup {
  private anotote_txt: string;
  private anotote_type: string;
  private anotote_identifier: string;
  private anotote_comment: any;
  private which_stream: string;
  private new_comment: any = '';

  constructor(public params: NavParams, public viewCtrl: ViewController, public utilityMethods: UtilityMethods) {
    this.anotote_txt = this.params.get('txt');
    this.anotote_identifier = this.params.get('identifier');
    this.anotote_type = this.params.get('type');
    this.anotote_comment = this.params.get('comment') == null ? '' : this.params.get('comment');
    this.which_stream = this.params.get('which_stream');
    this.new_comment = Object.assign(this.anotote_comment);
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

  updateComment() {
    if (this.new_comment != this.anotote_comment && this.new_comment != '')
      this.viewCtrl.dismiss({ share: false, delete: false, update: true, comment: this.new_comment });
    else
      this.utilityMethods.doToast("You didn't update any comment.");
  }

  presentTopInterestsModal() {
    this.viewCtrl.dismiss();
  }

}