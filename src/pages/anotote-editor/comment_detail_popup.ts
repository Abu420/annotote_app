import { Component, trigger, transition, style, animate, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { ViewController, NavParams, Events, ModalController } from 'ionic-angular';
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from "../../services/search.service";
import { StatusBar } from "@ionic-native/status-bar";
import { Keyboard } from "@ionic-native/keyboard";
import { TagsExclusive } from '../tagsExclusive/tags';
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
  public user: any;
  private users: any = [];
  public isTagging: boolean = false;
  public nameEntered: string = '';
  public nameInputIndex: number = 0;
  public mentioned: any = [];
  public fieldInContent: boolean = false;
  public actual_anotated: any = '';
  public bracketStartIndex = 0;
  public selected_follower_name: string = '';
  // public isKeyboardDeployed: boolean = false;
  public shouldPreventDefault = false;
  public total_followers = 0;
  public waitingMode = [];
  public waitingTime: number = 500;

  constructor(public params: NavParams,
    public viewCtrl: ViewController,
    public utilityMethods: UtilityMethods,
    private events: Events,
    public searchService: SearchService,
    public key: Keyboard,
    public cd: ChangeDetectorRef,
    private modalCtrl: ModalController,
    public statusbar: StatusBar) {
    // this.key.onKeyboardShow().subscribe(() => {
    //   this.isKeyboardDeployed = true;
    // })
    // this.key.onKeyboardHide().subscribe(() => {
    //   this.isKeyboardDeployed = false;
    // })
    this.anotote_txt = this.params.get('txt');
    this.actual_anotated = this.params.get('txt');
    this.anotote_identifier = this.params.get('identifier');
    this.anotote_type = this.params.get('type');
    this.anotote_comment = this.params.get('comment') == null ? '' : this.params.get('comment');
    this.stream = this.params.get('stream');
    this.selected_follower_name = params.get('follower_name');
    this.total_followers = params.get('total_followers');
    this.new_comment = Object.assign(this.anotote_comment);
    this.annotation = params.get('anotation');
    if (this.anotote_comment == '' && this.stream == 'me')
      this.fieldInContent = true;
    this.events.subscribe('closeModal', () => {
      this.dismiss();
    })
    if (utilityMethods.whichPlatform() == 'ios')
      statusbar.hide();
  }

  ionViewDidLoad() {
    // var box = document.getElementById('actualContent');
    var comment = document.getElementById('comment');
    // autosize(box);
    if (comment)
      autosize(comment);
    // box.addEventListener('paste', (event) => {
    //   let textarea: any = event.target;
    //   if (this.actionNeeded(textarea.selectionStart) && event.clipboardData.getData('Text') != '') {
    //     if (textarea.selectionStart == textarea.selectionEnd)
    //       var pastedValue = " [" + event.clipboardData.getData('Text') + "] ";
    //     else
    //       var pastedValue = ' "..." [' + event.clipboardData.getData('Text') + "] ";
    //     event.preventDefault();
    //     var result = this.anotote_txt.substr(0, textarea.selectionStart - 1).trim();
    //     result += pastedValue;
    //     var sec = this.anotote_txt.substring(textarea.selectionStart, this.anotote_txt.length).trim();
    //     this.anotote_txt = result + sec;
    //     setTimeout((place) => {
    //       var temp: any = document.getElementById('actualContent');
    //       temp.setSelectionRange(place, place);
    //       this.cd.detectChanges();
    //     }, 200, textarea.selectionStart + pastedValue.length - 3);
    //   }
    // })
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
    this.fieldInContent = false;
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
      var hashTags = this.searchService.searchTags('#', this.new_comment);
      var cashTags = this.searchService.searchTags('$', this.new_comment);
      var urls = this.searchService.uptags(this.new_comment);
      var mentions = this.searchService.userTags(this.new_comment);
      this.show = false;
      setTimeout(() => {
        this.statusbar.show();
        this.viewCtrl.dismiss({ share: false, delete: false, update: true, comment: this.new_comment, hash: hashTags, cash: cashTags, uptags: urls, mentions: mentions, anototeTxt: this.anotote_txt });
        // this.viewCtrl.dismiss({ share: false, delete: false, update: true, comment: this.new_comment });
      }, 100)
    } else
      this.utilityMethods.doToast("You didn't update any comment.");
  }

  tag_user(event) {
    if (event.target.value.charAt(event.target.value.length - 1) == '@' || event.target.value.charAt(event.target.value.length - 1) == '#' || event.target.value.charAt(event.target.value.length - 1) == '$') {
      this.nameInputIndex = event.target.selectionStart;
      var params = {
        tag: event.key
      }

      let tagsExlusive = this.modalCtrl.create(TagsExclusive, params);
      tagsExlusive.onDidDismiss((data) => {
        if (data) {
          // if (params.id != 2)
          this.new_comment = this.new_comment.substring(0, this.nameInputIndex - 1) + data.tag + " " + this.new_comment.substring(this.nameInputIndex + 1, this.new_comment.length);
          // else if (params.id == 2)
          // this.new_comment = this.new_comment.substring(0, this.nameInputIndex) + data.tag + " " + this.new_comment.substring(this.nameInputIndex, this.new_comment.length);
        }
      })
      tagsExlusive.present();
    } else {
      this.cd.detectChanges();
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

  pressed(event) {
    this.anotote_txt = event;
    // if (event.target.id == 'actualContent') {
    //   let textarea: HTMLTextAreaElement = event.target;
    //   if (event.key == "Backspace") {
    //     if (this.actionNeeded(textarea.selectionStart - 1)) {
    //       let charToDelete = this.anotote_txt.substr(textarea.selectionStart - 1, 1);
    //       if ((charToDelete == " " || textarea.selectionStart == 0) && textarea.selectionStart != textarea.selectionEnd) {
    //         if (this.anotote_txt.substring(textarea.selectionStart, textarea.selectionEnd) != '"..."' || this.anotote_txt.substring(textarea.selectionStart, textarea.selectionEnd) != '"...' || this.anotote_txt.substring(textarea.selectionStart, textarea.selectionEnd) != '"..' || this.anotote_txt.substring(textarea.selectionStart, textarea.selectionEnd) != '".' || this.anotote_txt.substring(textarea.selectionStart, textarea.selectionEnd) != '"') {
    //           var firstHalf = this.anotote_txt.substr(0, textarea.selectionStart).trim();
    //           firstHalf += ' "..." ';
    //           firstHalf += this.anotote_txt.substr(textarea.selectionEnd, this.anotote_txt.length).trim();
    //           this.anotote_txt = firstHalf;
    //           this.cd.detectChanges();
    //           setTimeout((place) => {
    //             var text: any = document.getElementById('actualContent');
    //             text.setSelectionRange(place, place);
    //             this.cd.detectChanges();
    //           }, 200, textarea.selectionStart + 5);
    //         } else {
    //           event.preventDefault();
    //           textarea.setSelectionRange(textarea.selectionEnd, textarea.selectionEnd);
    //         }
    //         return;
    //       }
    //       let nextChar = this.anotote_txt.substr(textarea.selectionStart, 1);
    //       if (nextChar == " " || nextChar == "" || this.utilityMethods.conatains_special_chars(nextChar)) {
    //         var start = textarea.selectionStart;
    //         var end = textarea.selectionStart;

    //         while (this.anotote_txt.substr(start - 1, 1) != " " && start - 1 >= 0) {
    //           start -= 1;
    //         }
    //         if (start != end) {
    //           event.preventDefault();
    //           textarea.setSelectionRange(start, end);
    //         }
    //       }
    //     } else {
    //       if (this.anotote_txt[textarea.selectionStart - 1] == '[')
    //         event.preventDefault();
    //       else if (this.anotote_txt[textarea.selectionEnd - 1] == ']') {
    //         event.preventDefault();
    //         textarea.setSelectionRange(textarea.selectionEnd, textarea.selectionEnd);
    //       }
    //     }
    //   } else {
    //     if (this.actionNeeded(textarea.selectionStart - 1)) {
    //       if (event.keyCode != 32 && event.keyCode >= 65 && event.keyCode <= 90) {
    //         event.preventDefault();
    //         if (this.shouldPreventDefault == false) {
    //           this.shouldPreventDefault = true;
    //           var result = this.anotote_txt.substr(0, textarea.selectionStart - 1).trim();
    //           result += ' [' + event.key + '] ';
    //           var sec = this.anotote_txt.substring(textarea.selectionStart, this.anotote_txt.length).trim();
    //           this.anotote_txt = result + sec;
    //           setTimeout((place) => {
    //             var word = '';
    //             for (let wait of this.waitingMode) {
    //               word += wait;
    //             }
    //             var result = this.anotote_txt.substr(0, place - 1).trim();
    //             result += word + ']';
    //             result += this.anotote_txt.substr(place, this.anotote_txt.length);
    //             this.anotote_txt = result;
    //             setTimeout((area) => {
    //               this.shouldPreventDefault = false;
    //               this.waitingMode = [];
    //               this.waitingTime = 500;
    //               var text: any = document.getElementById('actualContent');
    //               text.setSelectionRange(area, area);
    //               this.cd.detectChanges();
    //             }, 200, place + this.waitingMode.length);
    //           }, this.waitingTime, textarea.selectionStart + 1);
    //         } else {
    //           this.waitingMode.push(event.key);
    //           this.waitingTime += 200;
    //         }
    //       }
    //     }
    //   }
    // }
  }

  tagClick(event) {
    event.stopPropagation();
    var tag: string = event.target.textContent;
    var check = tag.split(' ');
    if (((tag[0] == '#' || tag[0] == '$') && check.length == 1) || (tag[0] == '@' && tag.length != this.new_comment.length - 1)) {
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
    } else {
      if (this.stream == 'me') {
        this.fieldInContent = true;
        setTimeout(() => {
          autosize(document.getElementById('comment'));
        }, 200);
        this.cd.detectChanges();
      }
    }
  }

}