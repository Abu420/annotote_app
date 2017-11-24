import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, Events } from 'ionic-angular';
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from "../../services/search.service";
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
  private show_autocomplete: boolean = false;
  private one_selected: { text: string, tagId: number, user_id: number, mentioned: number };
  private no_user_found: boolean = false;
  private no_tags_found: boolean = false;
  public user: any;
  private users: any = [];
  public isTagging: boolean = false;
  public nameEntered: string = '';
  public nameInputIndex: number = 0;
  private search_user: boolean = false;
  public mentioned: any = []

  constructor(public params: NavParams,
    public viewCtrl: ViewController,
    public utilityMethods: UtilityMethods,
    private events: Events,
    public searchService: SearchService) {
    this.anotote_txt = this.params.get('txt');
    this.anotote_identifier = this.params.get('identifier');
    this.anotote_type = this.params.get('type');
    this.anotote_comment = this.params.get('comment') == null ? '' : this.params.get('comment');
    this.stream = this.params.get('stream');
    this.new_comment = Object.assign(this.anotote_comment);
    this.annotation = params.get('anotation');
    this.events.subscribe('closeModal', () => {
      this.dismiss();
    })
  }

  dismiss() {
    if (this.new_comment != this.anotote_comment && this.new_comment != '') {
      this.utilityMethods.confirmation_message("Discard Changes", "Do you really want to discard changes ?", (choice) => {
        this.show = false;
        setTimeout(() => {
          this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '' });
        }, 100)
      })
    } else {
      this.show = false;
      setTimeout(() => {
        this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '' });
      }, 100)
    }
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
      var hashTags = this.searchTags('#');
      var cashTags = this.searchTags('$');
      var urls = this.uptags(this.new_comment);
      var mentions = this.userTags();
      this.show = false;
      setTimeout(() => {
        this.viewCtrl.dismiss({ share: false, delete: false, update: true, comment: this.new_comment, hash: hashTags, cash: cashTags, uptags: urls, mentions: mentions });
        // this.viewCtrl.dismiss({ share: false, delete: false, update: true, comment: this.new_comment });
      }, 100)
    } else
      this.utilityMethods.doToast("You didn't update any comment.");
  }

  uptags(comment) {
    var matches = [];
    matches = comment.match(/\bhttps?:\/\/\S+/gi);
    if (matches)
      for (let match of matches) {
        this.new_comment = this.new_comment.replace(match, '^');
      }
    return matches == null ? [] : matches;
  }

  userTags() {
    var matches = [];
    var finalized = [];
    matches = this.new_comment.split('`')
    for (let match of matches) {
      if (match[0] == '@') {
        finalized.push(match);
      }
    }
    return finalized;
  }

  searchTags(tag) {
    var tags = [];
    var check = false;
    if (this.new_comment[0] == tag) {
      check = true;
    }
    var tagsincomment = this.new_comment.split(tag);
    var i = check ? 0 : 1;
    for (var i = 1; i < tagsincomment.length; i++) {
      var temp = tagsincomment[i].split(' ');
      temp[0] = temp[0].replace(/[^\w\s]/gi, "")
      tags.push(temp[0]);
    }
    return tags;
  }

  tag_user() {
    if (this.new_comment[this.new_comment.length - 1] == '@') {
      this.nameInputIndex = this.new_comment.length - 1;
      this.isTagging = true;
    }
    if (this.isTagging) {
      if (this.nameInputIndex > this.new_comment.length - 1) {
        console.log('not tagging')
        this.show_autocomplete = false;
        this.users = [];
        this.isTagging = false;
        this.nameInputIndex = 0;
        return;
      } else if (this.nameInputIndex != this.new_comment.length - 1) {
        this.nameEntered = this.new_comment.substr(this.nameInputIndex + 1);
        if (this.nameEntered.split(' ').length == 1) {
          var params = {
            name: this.nameEntered
          }
          if (params.name != '') {
            this.no_user_found = false;
            this.show_autocomplete = true;
            this.search_user = true;
            this.users = [];
            this.searchService.autocomplete_users(params).subscribe((result) => {
              this.search_user = false;
              this.users = result.data.users;
              if (this.users.length == 0) {
                this.no_user_found = true;
              }
            }, (error) => {
              this.search_user = false;
              this.show_autocomplete = true;
              this.no_user_found = false;
              this.users = [];
              if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
              }
            })
          }
        } else {
          this.show_autocomplete = false;
          this.users = [];
          this.isTagging = false;
          this.nameInputIndex = 0;
          return;
        }
      }
    }

  }

  selected_user(user) {
    this.new_comment = this.new_comment.replace('@' + this.nameEntered, "`@" + user.firstName + "`")
    this.nameEntered = user.firstName;
    this.show_autocomplete = false;
    this.users = [];
    var selected = {
      text: '`@' + user.firstName + '`',
      tagId: 2,
      user_id: user.id
    }
    this.mentioned.push(selected)
    this.isTagging = false;
    this.nameInputIndex = 0;
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

  showtags() {
    this.show = false;
    setTimeout(() => {
      this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '', upvote: false, tags: true });
    }, 100)
  }

}