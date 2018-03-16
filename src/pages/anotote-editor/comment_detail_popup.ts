import { Component, trigger, transition, style, animate, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, Events } from 'ionic-angular';
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from "../../services/search.service";
import { StatusBar } from "@ionic-native/status-bar";
import { Keyboard } from "@ionic-native/keyboard";
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
  @ViewChild('actualContent') actual: ElementRef;
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
  public mentioned: any = [];
  public quoteThreeDots: boolean = false;
  public actual_anotated: any = '';
  public bracketStartIndex = 0;
  public selected_follower_name: string = '';
  public isKeyboardDeployed: boolean = false;
  public one: string = '';
  public currentIndex = 0;

  constructor(public params: NavParams,
    public viewCtrl: ViewController,
    public utilityMethods: UtilityMethods,
    private events: Events,
    public searchService: SearchService,
    public key: Keyboard,
    public statusbar: StatusBar) {
    this.key.onKeyboardShow().subscribe(() => {
      this.isKeyboardDeployed = true;
    })
    this.key.onKeyboardHide().subscribe(() => {
      this.isKeyboardDeployed = false;
    })
    this.anotote_txt = this.params.get('txt');
    this.actual_anotated = this.params.get('txt');
    this.anotote_identifier = this.params.get('identifier');
    this.anotote_type = this.params.get('type');
    this.anotote_comment = this.params.get('comment') == null ? '' : this.params.get('comment');
    this.stream = this.params.get('stream');
    this.selected_follower_name = params.get('follower_name').split(' ')[0];
    this.new_comment = Object.assign(this.anotote_comment);
    this.annotation = params.get('anotation');
    if (this.annotation.comment != null)
      this.quoteThreeDots = true;
    this.events.subscribe('closeModal', () => {
      this.dismiss();
    })
    if (utilityMethods.whichPlatform() == 'ios')
      statusbar.hide();
  }

  showTextarea() {
    this.quoteThreeDots = true;
  }

  dismiss() {
    if (this.new_comment != this.anotote_comment && this.new_comment != '') {
      this.utilityMethods.confirmation_message("Discard Changes", "Do you really want to discard changes ?", (choice) => {
        this.show = false;
        setTimeout(() => {
          if (this.utilityMethods.whichPlatform() == 'ios')
            this.statusbar.show();
          this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '' });
        }, 100)
      })
    } else {
      this.show = false;
      setTimeout(() => {
        if (this.utilityMethods.whichPlatform() == 'ios')
          this.statusbar.show();
        this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '' });
      }, 100)
    }
  }

  delete() {
    this.show = false;
    setTimeout(() => {
      this.statusbar.show();
      this.viewCtrl.dismiss({ delete: true, share: false, update: false, comment: '' });
    }, 100)
  }

  share() {
    this.show = false;
    setTimeout(() => {
      var share_txt = this.anotote_txt;
      this.statusbar.show();
      this.viewCtrl.dismiss({ share: true, delete: false, update: false, comment: share_txt });
    }, 100)
  }

  updateComment() {
    var test = this.anotote_txt.split(' ');
    var test1 = '';
    for (var i = 0; i < test.length; i++) {
      if (i == 0) {
        if (test[i][0] == '[') {
          if (test[i + 1][0] != '[') {
            test1 += ' ' + test[i];
          } else {
            test1 += ' ' + test[i].slice(test[i].length - 1);
          }
        } else {
          test1 += ' ' + test[i];
        }
      } else if (i > 0) {
        if (test[i][0] == '[') {
          if (test[i - 1][test[i - 1].length - 1] == ']') {
            if (test[i + 1][0] != '[') {
              test1 += ' ' + test[i].slice(1);
            } else {
              test1 += ' ' + test[i].slice(1, test[i].length - 1);
            }
          } else {
            if (test[i + 1][0] != '[') {
              test1 += ' ' + test[i];
            } else {
              test1 += ' ' + test[i].slice(0, test[i].length - 1);
            }
          }
        } else {
          test1 += ' ' + test[i];
        }

      }
    }
    this.anotote_txt = test1;
    if ((this.new_comment != this.anotote_comment && this.new_comment != '') || (this.anotote_txt != this.actual_anotated && this.anotote_txt != '')) {
      var hashTags = this.searchTags('#');
      var cashTags = this.searchTags('$');
      var urls = this.uptags(this.new_comment);
      var mentions = this.userTags();
      this.show = false;
      setTimeout(() => {
        this.statusbar.show();
        this.viewCtrl.dismiss({ share: false, delete: false, update: true, comment: this.new_comment, hash: hashTags, cash: cashTags, uptags: urls, mentions: mentions, anototeTxt: this.anotote_txt });
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
        this.new_comment = this.new_comment.replace(match, ' ^ ');
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
      this.statusbar.show();
      this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '', upvote: true });
    }, 100)
  }

  downvote() {
    this.show = false;
    setTimeout(() => {
      this.statusbar.show();
      this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '', upvote: false, downvote: true });
    }, 100)
  }

  presentTopInterestsModal() {
    this.statusbar.show();
    this.viewCtrl.dismiss();
  }

  showtags() {
    this.show = false;
    setTimeout(() => {
      this.statusbar.show();
      this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '', upvote: false, tags: true });
    }, 100)
  }

  ellipsis(event) {
    if (this.one != this.anotote_txt) {
      if (this.one.split('"..."').length == this.anotote_txt.split('"..."').length) {
        if (event.target.selectionStart < this.currentIndex) {
          let textarea: HTMLTextAreaElement = event.target;
          if ((this.anotote_txt[textarea.selectionStart] == undefined || this.anotote_txt[textarea.selectionStart] == ' ' || this.anotote_txt[textarea.selectionStart] == '\n') && (this.anotote_txt[textarea.selectionStart - 1] == '\n' || this.anotote_txt[textarea.selectionStart - 1] == ' ')) {
            var firstHalf = this.anotote_txt.substr(0, textarea.selectionStart);
            firstHalf += '"..."';
            firstHalf += this.anotote_txt.substr(textarea.selectionStart, this.anotote_txt.length);
            this.anotote_txt = firstHalf;
          }
        } else {
          let textarea: HTMLTextAreaElement = event.target;
          if (this.bracketStartIndex == 0)
            this.bracketStartIndex = textarea.selectionStart - 1;
          else if (this.bracketStartIndex > 0 && this.bracketStartIndex < textarea.selectionStart - 1) {
            if (this.anotote_txt[textarea.selectionStart - 1] == ' ') {
              var firstHalf = this.anotote_txt.substr(0, this.bracketStartIndex);
              firstHalf += ' [';
              var sec = this.anotote_txt.substring(this.bracketStartIndex, textarea.selectionStart);
              sec = sec.trim();
              firstHalf += sec + '] ';
              firstHalf += this.anotote_txt.substr(textarea.selectionStart, this.anotote_txt.length);
              this.anotote_txt = firstHalf;
              this.bracketStartIndex = 0;
              this.one = JSON.parse(JSON.stringify(this.anotote_txt));
            }
          }
        }
      } else {
        this.anotote_txt = JSON.parse(JSON.stringify(this.one));
        event.target.blur();
      }
    }
    // if (this.anotote_txt.length > this.actual_anotated.length) {
    //   let textarea: HTMLTextAreaElement = event.target;
    //   if (this.bracketStartIndex == 0)
    //     this.bracketStartIndex = textarea.selectionStart - 1;
    //   else if (this.bracketStartIndex > 0 && this.bracketStartIndex < textarea.selectionStart - 1) {
    //     if (this.anotote_txt[textarea.selectionStart - 1] == ' ') {
    //       var firstHalf = this.anotote_txt.substr(0, this.bracketStartIndex);
    //       firstHalf += '"[';
    //       var sec = this.anotote_txt.substring(this.bracketStartIndex, textarea.selectionStart);
    //       sec.trim();
    //       firstHalf += sec + ']"';
    //       firstHalf += this.anotote_txt.substr(textarea.selectionStart, this.anotote_txt.length);
    //       this.anotote_txt = firstHalf;
    //       this.bracketStartIndex = 0;
    //     }
    //   }
    // } else if (this.anotote_txt.length < this.actual_anotated.length) {
    //   let textarea: HTMLTextAreaElement = event.target;
    //   console.log(this.anotote_txt[textarea.selectionStart - 1])
    //   if (this.anotote_txt[textarea.selectionStart - 1] == ' ' || (this.anotote_txt[textarea.selectionStart - 1] == '\n' && this.anotote_txt[textarea.selectionStart] != "[^!@%~?:#$%^&*()0']*")) {
    //     // this.anotote_txt.splice(textarea.selectionStart, 0, "...");
    //     var firstHalf = this.anotote_txt.substr(0, textarea.selectionStart - 1);
    //     firstHalf += '"..."';
    //     firstHalf += this.anotote_txt.substr(textarea.selectionStart, this.anotote_txt.length);
    //     this.anotote_txt = firstHalf;
    //     textarea.blur();
    //   }
    // }
    // this.anotote_txt = this.anotote_txt.replace('"...""..."','"..."');
  }

  initialize(event) {
    this.currentIndex = event.target.selectionStart;
    this.one = JSON.parse(JSON.stringify(event.target.value));
  }

  tagClick(event) {
    event.stopPropagation();
    var tag: string = event.target.textContent;
    var check = tag.split(' ');
    if ((tag[0] == '#' || tag[0] == '$' || tag[0] == '@') && check.length == 1) {
      tag = tag.replace('#', '');
      tag = tag.replace('$', '');
      tag = tag.replace('@', '');
      this.show = false;
      setTimeout(() => {
        this.statusbar.show();
        this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '', upvote: false, tags: true, search: tag, link: false });
      }, 100)
    } else if (tag[0] == '^') {
      this.show = false;
      setTimeout(() => {
        this.statusbar.show();
        this.viewCtrl.dismiss({ delete: false, share: false, update: false, comment: '', upvote: false, tags: true, search: tag, link: true });
      }, 100)
    }
  }

}