import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
import { UtilityMethods } from '../../services/utility_methods';
@Component({
  selector: 'comment_detail_popup',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ transform: 'translateY(100%)', opacity: 0 }),
          animate('300ms', style({ transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateY(0)', opacity: 1 }),
          animate('300ms', style({ transform: 'translateY(100%)', opacity: 0 }))
        ])
      ]
    )
  ],
  templateUrl: 'comment_detail_popup.html',
})
export class CommentDetailPopup {
  private anotote_txt: string;
  private anotote_type: string;
  private anotote_identifier: string;
  private anotote_comment: any;
  private stream: string;
  private new_comment: any = '';
  public show: boolean = true;
  public annotation;

  constructor(public params: NavParams, public viewCtrl: ViewController, public utilityMethods: UtilityMethods) {
    this.anotote_txt = this.params.get('txt');
    this.anotote_identifier = this.params.get('identifier');
    this.anotote_type = this.params.get('type');
    this.anotote_comment = this.params.get('comment') == null ? '' : this.params.get('comment');
    this.stream = this.params.get('stream');
    this.new_comment = Object.assign(this.anotote_comment);
    this.annotation = params.get('anotation');
  }

  dismiss() {
    this.show = false;
    setTimeout(() => {
      this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '' });
    }, 100)
  }

  delete() {
    this.show = false;
    setTimeout(() => {
      this.viewCtrl.dismiss({ delete: true, share: false, update: false, comment: '' });
    }, 100)
  }

  share() {
    this.show = false;
    setTimeout(() => {
      var share_txt = this.anotote_txt;
      this.viewCtrl.dismiss({ share: true, delete: false, update: false, comment: share_txt });
    }, 100)
  }

  updateComment() {
    if (this.new_comment != this.anotote_comment && this.new_comment != '') {
      this.show = false;
      setTimeout(() => {
        this.viewCtrl.dismiss({ share: false, delete: false, update: true, comment: this.new_comment });
      }, 100)
    } else
      this.utilityMethods.doToast("You didn't update any comment.");
  }

  upvote() {
    this.show = false;
    setTimeout(() => {
      this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '', upvote: true });
    }, 100)
  }

  downvote() {
    this.show = false;
    setTimeout(() => {
      this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '', upvote: false, downvote: true });
    }, 100)
  }

  presentTopInterestsModal() {
    this.viewCtrl.dismiss();
  }

  presentOptions() {
    this.utilityMethods.tags_or_comment((choice) => {
      if (choice == 'tags') {
        this.showtags();
      } else if (choice == 'comment') {
        this.utilityMethods.comment(this.new_comment, (comment) => {
          this.new_comment = comment.comment;
          this.updateComment();
        })
      }
    })
  }

  showtags() {
    this.show = false;
    setTimeout(() => {
      this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '', upvote: false, tags: true });
    }, 100)
  }

}