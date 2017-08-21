import { Component, ViewChild, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, ModalController, Content, NavController, ToastController, Toast, NavParams, AlertController } from 'ionic-angular';
import { AnototeDetail } from '../anotote-detail/anotote-detail';
import { AnototeEditor } from '../anotote-editor/anotote-editor';
import { Anotote } from '../../models/anotote';
import { StatusBar } from '@ionic-native/status-bar';
import { AnototeOptions } from '../anotote-list/tote_options';
import { ViewOptions } from '../anotote-list/view_options';
import { TagsPopUp } from '../anotote-list/tags';
import { FollowsPopup } from '../anotote-list/follows_popup';
import { Chat } from '../chat/chat';
import { Search } from '../search/search';

/**
 * Services
 */
import { SearchService } from '../../services/search.service';
import { UtilityMethods } from '../../services/utility_methods';
import { ListTotesModel } from "../../models/ListTotesModel";
import { AnototeService } from "../../services/anotote.service";
import { Follows } from "../follows/follows";
import { User } from "../../models/user";
import { AuthenticationService } from "../../services/auth.service";
import { ChatHeads } from "../../services/pipes"

@IonicPage()
@Component({
  selector: 'page-anotote-list',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ transform: 'translateY(100%)', opacity: 0 }),
          animate('500ms', style({ transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateY(0)', opacity: 1 }),
          animate('500ms', style({ transform: 'translateY(100%)', opacity: 0 }))
        ])
      ]
    )
  ],
  templateUrl: 'anotote-list.html',
})

export class AnototeList {

  /**
   * Variables && Configs
   */
  @ViewChild(Content) content: Content;
  public anototes: Array<ListTotesModel>;
  public edit_mode: boolean; // True for edit list mode while false for simple list
  public current_active_anotote: any;
  public toast: Toast;
  public current_color: string;
  public reply_box_on: boolean;
  public whichStream: string = 'me';
  public current_page: number = 1;
  public has_totes: boolean = true;
  public messages: any = [];
  private reorder_highlights: boolean;
  public user: User;
  public selected_totes: any = [];
  public infinite_scroll: any;
  public top_anototes: any = []
  public spinner_for_active: boolean = false;
  public top_spinner: boolean = false;
  public me_spinner: boolean = false;
  public current_active_highlight: any = null;
  public edit_highlight_text: string = '';

  /**
   * Constructor
   */
  constructor(public searchService: SearchService, public authService: AuthenticationService, public anototeService: AnototeService, public navCtrl: NavController, public modalCtrl: ModalController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods, private toastCtrl: ToastController, private alertCtrl: AlertController) {
    this.current_color = navParams.get('color');
    this.whichStream = navParams.get('color');
    this.reply_box_on = false;
    this.anototes = new Array<ListTotesModel>();
    this.user = authService.getUser();
    this.reorder_highlights = false;
  }

  /**
   * View LifeCycle Events
   */
  ionViewDidLoad() {
    // set status bar to green
    if (this.current_color == 'me')
      this.statusBar.backgroundColorByHexString('#3bde00');
    else if (this.current_color == 'follows')
      this.statusBar.backgroundColorByHexString('#f4e300');
    else
      this.statusBar.backgroundColorByHexString('#fb9df0');
    // this.anototes = [];

    // this.edit_mode = false;
    // let anototes: Array<ListTotesModel> = [];

    // this.utilityMethods.show_loader('', false);
    // this.anototeService.fetchTotes(this.whichStream).subscribe((data) => {
    //   let stream = data.json().data.annototes;
    //   for (let entry of stream) {
    //     this.anototes.push(new ListTotesModel(entry.id, entry.type, entry.userToteId, entry.chatGroupId, entry.userAnnotote, entry.chatGroup, entry.createdAt, entry.updatedAt));
    //   }
    //   if (this.anototes.length == 0) {
    //     this.has_totes = false;
    //   }
    //   this.utilityMethods.hide_loader();
    // }, (error) => {
    //   this.utilityMethods.hide_loader();
    //   if (error.code == -1) {
    //     this.utilityMethods.internet_connection_error();
    //   }
    // });
  }

  ionViewDidLeave() {
    this.anototes = [];
    this.top_anototes = [];
  }
  ionViewDidEnter() {
    this.anototes = [];
    if (this.infinite_scroll)
      this.infinite_scroll.enable(true);
    /**
     * Set default mode to list not the edit one
     */
    this.edit_mode = false;
    let anototes: Array<ListTotesModel> = [];
    this.current_page = 1;
    this.current_active_anotote = null;

    if (this.current_color != 'top') {
      this.utilityMethods.show_loader('', false);
      this.anototeService.fetchTotes(this.whichStream).subscribe((data) => {
        let stream = data.json().data.annototes;
        for (let entry of stream) {
          this.anototes.push(new ListTotesModel(entry.id, entry.type, entry.userToteId, entry.chatGroupId, entry.userAnnotote, entry.chatGroup, entry.createdAt, entry.updatedAt));
        }
        if (this.anototes.length == 0) {
          this.has_totes = false;
        }
        this.utilityMethods.hide_loader();
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
    } else {
      this.utilityMethods.show_loader('', false);
      let params = {
        number: this.current_page++,
        time: this.utilityMethods.get_php_wala_time()
      }
      this.anototeService.top_totes(params).subscribe((result) => {
        this.utilityMethods.hide_loader();
        this.top_anototes = result.data.annototes;
        if (this.top_anototes.length == 0) {
          this.has_totes = false;
        }
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
    }

  }

  /**
   * Methods
   */

  showMeHighlights(anotote) {
    if (this.current_color == 'me') {
      this.current_active_anotote.activeParty = 1;
      anotote.highlights = Object.assign(anotote.userAnnotote.annototeHeighlights);
      anotote.active_tab = 'me'
    } else if (this.current_color == 'follows' || this.current_color == 'top') {
      if (anotote.my_highlights == undefined) {
        this.me_spinner = true;
        var params = {
          user_id: this.user.id,
          anotote_id: anotote.userAnnotote.id,
          time: this.utilityMethods.get_php_wala_time()
        }
        this.anototeService.fetchToteDetails(params).subscribe((result) => {
          this.me_spinner = false;
          if (result.status == 1) {
            anotote.active_tab = 'me'
            anotote.highlights = Object.assign(result.data.annotote.highlights);
            anotote.my_highlights = result.data.annotote.highlights;
          } else {
            this.utilityMethods.doToast("Couldn't fetch annotations");
            anotote.active = false;
          }
        }, (error) => {
          this.me_spinner = false;
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
            this.utilityMethods.doToast("Couldn't load chat history.");
          }
        });
      } else {
        anotote.active_tab = 'me'
        anotote.highlights = Object.assign(anotote.my_highlights);
      }
    }
  }

  open_browser(anotote, highlight) {
    if (anotote.userAnnotote.filePath != '') {
      if (this.current_active_highlight == null || this.current_active_highlight.edit == false) {
        if (this.current_color != 'top') {
          this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'anotote_list', WHICH_STREAM: this.whichStream, HIGHLIGHT_RECEIVED: highlight });
        } else {
          let tote = {
            active: anotote.active,
            userAnnotote: anotote.userAnnotote,
            followers: anotote.follows,
            highlights: anotote.highlights,
            annototeId: anotote.annotote.id
          }
          tote.userAnnotote.annotote = anotote.annotote;
          this.navCtrl.push(AnototeEditor, { ANOTOTE: tote, FROM: 'anotote_list', WHICH_STREAM: this.whichStream, HIGHLIGHT_RECEIVED: highlight });
        }
      } else {
        // this.current_active_highlight.edit = false;
      }
    } else {
      this.utilityMethods.doToast("Couldn't load as no file was found.");
    }

  }

  reorderItems(indexes, anotote) {
    let element = anotote.highlights[indexes.from];
    anotote.highlights.splice(indexes.from, 1);
    anotote.highlights.splice(indexes.to, 0, element);

    var _anotation_ids = "", _orders = "", counter = 1;
    for (let highlight of anotote.highlights) {
      _anotation_ids += highlight.id + ",";
      _orders += counter + ",";
      counter++;
    }
    if (_anotation_ids.length > 0)
      _anotation_ids = _anotation_ids.slice(0, -1);
    if (_orders.length > 0)
      _orders = _orders.slice(0, -1);

    this.searchService.reorder_anotation({ annotation_ids: _anotation_ids, order: _orders })
      .subscribe((res) => {
        console.log(res);
      }, (error) => {
        console.log(error);
      });
  }

  doInfinite(infiniteScroll) {
    this.infinite_scroll = infiniteScroll;
    if (this.current_color != 'top') {
      this.anototeService.fetchTotes(this.whichStream, ++this.current_page).subscribe((data: any) => {
        let stream = data.json().data.annototes;
        for (let entry of stream) {
          this.anototes.push(new ListTotesModel(entry.id, entry.type, entry.userToteId, entry.chatGroupId, entry.userAnnotote, entry.chatGroup, entry.createdAt, entry.updatedAt));
        }
        infiniteScroll.complete();
        if (stream.length < 10) {
          infiniteScroll.enable(false);
        }
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
    } else {
      let params = {
        number: this.current_page++,
        time: this.utilityMethods.get_php_wala_time()
      }
      this.anototeService.top_totes(params).subscribe((result) => {
        this.utilityMethods.hide_loader();
        for (let totes of result.data.annototes) {
          this.top_anototes.push(totes);
        }
        infiniteScroll.complete();
        if (result.data.annototes.length < 10) {
          infiniteScroll.enable(false);
        }
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
    }
  }

  follows(event) {
    event.stopPropagation();
    this.navCtrl.push(Follows, {});
  }

  open_follows_popup(event, anotote) {
    event.stopPropagation();
    if (anotote.followers.length > 0) {
      let anototeOptionsModal = this.modalCtrl.create(FollowsPopup, { follows: anotote.followers });
      anototeOptionsModal.onDidDismiss(data => {
        if (data != null) {
          anotote.selected_follower_name = data.user.firstName;
          anotote.active_tab = 'follows'
          if (data.user.anotote == null) {
            this.spinner_for_active = true;
            var params = {
              user_id: data.user.id,
              anotote_id: anotote.userAnnotote.id,
              time: this.utilityMethods.get_php_wala_time()
            }
            this.anototeService.fetchToteDetails(params).subscribe((result) => {
              this.spinner_for_active = false;
              data.user.anotote = result.data.annotote;
              anotote.highlights = Object.assign(result.data.annotote.highlights);
            }, (error) => {
              this.spinner_for_active = false;
              if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
              }
            });
          } else {
            anotote.highlights = Object.assign(data.user.anotote.highlights);
          }
        }
      });
      anototeOptionsModal.present();
    } else {
      this.utilityMethods.doToast('No one follows this anotote.');
    }

  }

  top_follows_popup(event, anotote) {
    event.stopPropagation();
    if (anotote.follows.length > 0) {
      let anototeOptionsModal = this.modalCtrl.create(FollowsPopup, { follows: anotote.follows });
      anototeOptionsModal.onDidDismiss(data => {
        if (data != null) {
          anotote.selected_follower_name = data.user.firstName;
          anotote.active_tab = 'follows'
          if (data.user.anotote == null) {
            this.spinner_for_active = true;
            var params = {
              user_id: data.user.id,
              anotote_id: anotote.userAnnotote.id,
              time: this.utilityMethods.get_php_wala_time()
            }
            this.anototeService.fetchToteDetails(params).subscribe((result) => {
              this.spinner_for_active = false;
              data.user.anotote = result.data.annotote;
              anotote.highlights = Object.assign(result.data.annotote.highlights);
            }, (error) => {
              this.spinner_for_active = false;
              if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
              }
            });
          } else {
            anotote.highlights = Object.assign(data.user.anotote.highlights);
          }
        }
      });
      anototeOptionsModal.present();
    } else {
      this.utilityMethods.doToast('No one follows this anotote.');
    }

  }

  show_top_tab(anotote) {
    if (anotote.top_highlights == undefined) {
      this.top_spinner = true;
      var params = {
        user_id: this.user.id,
        anotote_id: anotote.topUserToteId,
        time: this.utilityMethods.get_php_wala_time()
      }
      this.anototeService.fetchToteDetails(params).subscribe((result) => {
        this.top_spinner = false;
        anotote.active_tab = 'top'
        if (result.status == 1) {
          anotote.highlights = Object.assign(result.data.annotote.highlights);
          anotote.top_highlights = result.data.annotote.highlights;
        } else {
          this.utilityMethods.doToast("Could not fetch top data");
        }
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      })
    } else {
      anotote.active_tab = 'top'
      anotote.highlights = Object.assign(anotote.top_highlights);
    }
  }

  show_reply_box() {
    this.reply_box_on = true;
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  bulkAction(anotote) {
    if (this.current_color != 'top') {
      if (anotote.active)
        return;
      if (this.edit_mode == false && anotote.chatGroup == null) {
        this.edit_mode = true;
        anotote.checked = !anotote.checked;
        this.selected_totes.push(anotote);
      } else {
        if (anotote.chatGroup != null) {
          this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to delete this chat group", () => {
            var params = {
              group_id: anotote.chatGroupId
            }
            this.utilityMethods.show_loader('');
            this.anototeService.delete_chat_tote(params).subscribe((result) => {
              this.utilityMethods.hide_loader();
              this.anototes.splice(this.anototes.indexOf(anotote), 1);
              this.utilityMethods.doToast("Chat tote deleted Successfully.")
              this.close_bulk_actions();
            }, (error) => {
              this.utilityMethods.hide_loader();
              if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
              }
            })
          })
        }
      }
    } else {
      if (anotote.active)
        return;
      if (this.edit_mode == false) {
        this.edit_mode = true;
        if (anotote.checked) {
          anotote.checked = false;
        } else {
          anotote.checked = true;
        }
      }
    }

  }

  close_bulk_actions() {
    this.edit_mode = false;
    this.selected_totes = [];
    if (this.current_color != 'top')
      for (let tote of this.anototes) {
        if (tote.checked) {
          tote.checked = false;
        }
      }
    else
      for (let tote of this.top_anototes) {
        if (tote.checked) {
          tote.checked = false;
        }
      }
  }

  popView() {
    this.navCtrl.pop();
  }

  go_to_editor() {
    if (this.current_active_anotote != null)
      this.navCtrl.push(AnototeEditor, { ANOTOTE: this.current_active_anotote, FROM: 'anotote_list', WHICH_STREAM: this.whichStream, HIGHLIGHT_RECEIVED: this.current_active_highlight });
    else
      this.utilityMethods.doToast("Please select an annotote whose annotations you want to make.");
  }

  //generic for all three streams
  openAnototeDetail(anotote) {
    this.reorder_highlights = false;
    if (this.current_color != 'top') {
      if (!this.edit_mode) {
        //anotation tabs logic
        if (this.current_color == 'me')
          anotote.active_tab = 'me'
        else if (this.current_color == 'follows')
          anotote.active_tab = 'follows'
        //-----
        if (this.current_active_anotote) {
          if (this.current_active_anotote.type == 2)
            this.content.resize();
          this.current_active_anotote.active = false;
          if (this.current_active_anotote.id == anotote.id) {
            this.current_active_anotote = null;
            return;
          }
        }
        this.current_active_anotote = anotote;
        this.current_active_anotote.active = !this.current_active_anotote.active;
        if (this.current_active_anotote.type == 2)
          this.content.resize();

        if (this.current_active_anotote.type == 1 && this.whichStream == 'me') {
          this.current_active_anotote.activeParty = 1;
          this.setSimpleToteDetails(anotote);
        } else if (this.current_active_anotote.type == 1 && this.whichStream == 'follows') {
          this.current_active_anotote.activeParty = 2;
          this.setSimpleToteDetails(anotote);
        } else if (this.current_active_anotote.type == 2 && this.whichStream == 'me') {
          this.getQuickChatHistory(anotote);
        }
      } else {
        if (anotote.active) {
          anotote.active = false;
        }
        if (anotote.chatGroupId == null) {
          if (anotote.checked) {
            this.selected_totes.splice(this.selected_totes.indexOf(anotote), 1);
            anotote.checked = false;
          } else {
            this.selected_totes.push(anotote);
            anotote.checked = true;
          }
        } else {
          this.utilityMethods.message_alert("Information", "You cannot select a chat tote. If you want to delete it, please long press it.")
        }
      }
    } else {
      if (this.edit_mode) {
        if (anotote.active)
          anotote.active = false;
        if (anotote.checked) {
          this.selected_totes.splice(this.selected_totes.indexOf(anotote), 1);
          anotote.checked = false;
        } else {
          this.selected_totes.push(anotote);
          anotote.checked = true;
        }
      } else {
        if (this.current_active_anotote) {
          this.current_active_anotote.active = false;
          if (this.current_active_anotote.id == anotote.id) {
            this.current_active_anotote = null;
            return;
          }
        }
        if (anotote.active)
          anotote.active = false;
        else
          anotote.active = true;
        anotote.active_tab = 'top';
        this.current_active_anotote = anotote;
        //Details
        this.spinner_for_active = true;
        var params = {
          user_id: this.user.id,
          anotote_id: anotote.userAnnotote.id,
          time: this.utilityMethods.get_php_wala_time()
        }
        this.anototeService.fetchToteDetails(params).subscribe((result) => {
          this.spinner_for_active = false;
          if (result.status == 1) {
            if (result.data.annotote.follows.length > 0)
              anotote.selected_follower_name = result.data.annotote.follows[0].firstName;
            anotote.follows = result.data.annotote.follows;
            anotote.top_highlights = Object.assign(result.data.annotote.highlights);
            anotote.highlights = result.data.annotote.highlights;
            anotote.isMe = result.data.annotote.isMe;
          } else {
            this.utilityMethods.doToast("Couldn't fetch annotations");
            anotote.active = false;
          }
        }, (error) => {
          this.spinner_for_active = false;
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
            this.utilityMethods.doToast("Couldn't load chat history.");
          }
        });
      }
    }
  }

  public getQuickChatHistory(tote) {
    this.spinner_for_active = true;
    this.messages = [];
    var param;
    if (tote.chatGroup.groupUsers[0].user.id == this.user.id)
      param = tote.chatGroup.groupUsers[1].user.id;
    else
      param = tote.chatGroup.groupUsers[0].user.id;
    this.anototeService.quickChat(param).subscribe((result) => {
      this.spinner_for_active = false;
      if (result.status == 1) {
        this.messages = result.data.messages;
      } else {
        this.utilityMethods.doToast("Couldn't load chat history.");
      }
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
      this.utilityMethods.doToast("Couldn't load chat history.");
    });
  }

  annotation_options(highlight) {
    if (this.current_color == 'me') {
      this.reorder_highlights = false;
      if (highlight.edit == undefined || highlight.edit == false) {
        this.utilityMethods.reorder_or_edit((prefrence) => {
          if (prefrence == 'reorder') {
            this.enable_list_reorder()
          } else {
            this.edit_annotation(highlight);
          }
        })
      } else {
        highlight.edit = false;
      }
    }
  }

  enable_list_reorder() {
    if (this.whichStream == 'me')
      this.reorder_highlights = true;
  }

  edit_annotation(highlight) {
    if (this.current_active_highlight != null) {
      if (this.current_active_highlight.id != highlight.id) {
        this.current_active_highlight.edit = false;
        if (highlight.edit)
          highlight.edit = false;
        else {
          highlight.edit = true;
          this.edit_highlight_text = highlight.comment == null ? '' : highlight.comment;
        }
        this.current_active_highlight = highlight;
      } else {
        if (highlight.edit)
          highlight.edit = false;
        else {
          highlight.edit = true;
          this.edit_highlight_text = highlight.comment == null ? '' : highlight.comment;
        }
      }
    } else {
      if (highlight.edit)
        highlight.edit = false;
      else {
        highlight.edit = true;
        this.edit_highlight_text = highlight.comment == null ? '' : highlight.comment;
      }
      this.current_active_highlight = highlight;
    }

  }

  delete_annotation(annotation) {
    this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to delete this annotation?", () => {
      var params = {
        user_annotate_id: this.current_active_anotote.userAnnotote.id,
        identifier: annotation.identifier,
        file_text: this.current_active_anotote.userAnnotote.fileText,
        delete: 1
      }
      this.anototeService.delete_annotation(params).subscribe((result) => {
        this.current_active_anotote.highlights.splice(this.current_active_anotote.highlights.indexOf(annotation), 1);
      }, (error) => {
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        } else {
          this.utilityMethods.doToast("Couldn't delete annotation.");
        }
      })
    })
  }

  show_tags_for_annotation(annotation) {
    if (this.current_color != 'me' && annotation.tags.length == 0) {
      this.utilityMethods.doToast("This annotation does not contain any tags.");
      return;
    }
    var params = {
      annotation_id: annotation.id,
      tags: annotation.tags,
      whichStream: this.current_color,
      annotote: false
    }
    let tagsModal = this.modalCtrl.create(TagsPopUp, params);
    tagsModal.present();

  }

  save_edited_annotation(highlight) {
    if (this.edit_highlight_text != highlight.comment && this.edit_highlight_text != '') {
      this.spinner_for_active = true;
      var params = {
        highlight_text: highlight.highlightText,
        updated_at: this.utilityMethods.get_php_wala_time(),
        file_text: this.current_active_anotote.userAnnotote.fileText,
        comment: this.edit_highlight_text,
        identifier: highlight.identifier,
        user_tote_id: this.current_active_anotote.userAnnotote.id
      }
      this.anototeService.update_annotation(params).subscribe((result) => {
        this.spinner_for_active = false;
        highlight.comment = result.data.highlight.comment;
        highlight.edit = false;
      }, (error) => {
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        } else {
          this.utilityMethods.doToast("Couldn't update annotation.");
        }
      })
    } else {
      this.utilityMethods.doToast("Please update annotation and then submit.");
    }
  }

  //me stream anotote detail calls
  public setSimpleToteDetails(anotote) {
    if (anotote.followers.length == 0) {
      this.spinner_for_active = true;
      var params = {
        user_id: this.user.id,
        anotote_id: anotote.userAnnotote.id,
        time: this.utilityMethods.get_php_wala_time()
      }
      if (this.current_color == 'follows') {
        params.user_id = anotote.userAnnotote.userId;
      }
      this.anototeService.fetchToteDetails(params).subscribe((result) => {
        this.spinner_for_active = false;
        if (result.status == 1) {
          if (result.data.annotote.follows.length > 0)
            anotote.selected_follower_name = result.data.annotote.follows[0].firstName;
          anotote.followers = result.data.annotote.follows;
          anotote.isTop = result.data.annotote.isTop;
          anotote.isMe = result.data.annotote.isMe;
          if (anotote.isTop == 1)
            anotote.topUserToteId = result.data.annotote.topUserToteId;
        } else {
          this.utilityMethods.doToast("Couldn't fetch annotations");
          anotote.active = false;
        }
      }, (error) => {
        this.spinner_for_active = false;
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
          this.utilityMethods.doToast("Couldn't load chat history.");
        }
      });
    }

  }

  presentToast() {
    if (this.toast != null) {
      this.toast.dismiss();
    }
    this.toast = this.toastCtrl.create({
      message: 'Reply to Chantal Bardaro',
      position: 'bottom',
      dismissOnPageChange: true,
      showCloseButton: false,
      cssClass: 'bottom_snakbar'
    });

    this.toast.onDidDismiss(() => {
    });

    this.toast.present();
  }

  go_to_chat_thread(groupUsers: Array<any>) {
    let secondUser: any = null;
    for (let group of groupUsers) {
      if (group.user.id != this.user.id) {
        secondUser = group.user;
      }
    }
    this.navCtrl.push(Chat, { secondUser: secondUser });
  }

  presentAnototeOptionsModal(event, anotote) {
    event.stopPropagation();
    let anototeOptionsModal = this.modalCtrl.create(AnototeOptions, null);
    anototeOptionsModal.onDidDismiss(data => {
      if (data.tags) {
        var params = {
          user_tote_id: anotote.userAnnotote.id,
          tags: anotote.userAnnotote.annototeTags,
          whichStream: this.current_color,
          annotote: true
        }
        let tagsModal = this.modalCtrl.create(TagsPopUp, params);
        tagsModal.present();
      }
    });
    anototeOptionsModal.present();
  }

  openSearchPopup() {
    var url = '';
    if (this.current_active_anotote != null && this.current_active_anotote.userAnnotote && (this.current_color == 'me' || this.current_color == 'follows'))
      url = this.current_active_anotote.userAnnotote.annotote.link;
    else if (this.current_active_anotote != null && this.current_color == 'top') {
      url = this.current_active_anotote.annotote.link;
    } else {
      this.statusBar.backgroundColorByHexString('#252525');
    }
    let searchModal = this.modalCtrl.create(Search, { link: url, stream: this.current_color });
    searchModal.onDidDismiss(data => {
      if (this.current_active_anotote == null) {
        if (this.current_color == 'me')
          this.statusBar.backgroundColorByHexString('#3bde00');
        else if (this.current_color == 'follows')
          this.statusBar.backgroundColorByHexString('#f4e300');
        else
          this.statusBar.backgroundColorByHexString('#fb9df0');
      }
    });
    searchModal.present();
  }

  presentViewOptionsModal() {
    let viewsOptionsModal = this.modalCtrl.create(ViewOptions, null);
    viewsOptionsModal.present();
  }

  share_totes() {
    var message = '';
    for (let tote of this.selected_totes) {
      message += tote.userAnnotote.filePath + '\n';
    }
    this.utilityMethods.share_content_native(message, '', '', '');
  }

  confirm_popUp(action) {
    if (this.selected_totes.length > 0) {
      if (action == 'delete') {
        var message = '';
        if (this.selected_totes.length == 1)
          message = "Do you really want to delete this anotation?"
        else
          message = "Do you really want to delete these anotation?"

        this.utilityMethods.confirmation_message("Are you sure?", message, () => {
          this.delete_totes();
        })
      } else if (action == 'privacy') {
        this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to change privacy?", () => {
          this.tote_privacy();
        })
      } else if (action == 'save') {
        this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to save?", () => {
          this.save_totes();
        })
      } else if (action == 'bookmark') {
        this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to bookmark?", () => {
          this.bookmark_totes();
        })
      }
    } else {
      this.utilityMethods.doToast("Please, select an anotote first.");
    }

  }

  delete_totes() {
    var ids = '';
    for (let anotote of this.selected_totes) {
      if (ids == '')
        ids += anotote.userAnnotote.id
      else
        ids += ',' + anotote.userAnnotote.id
    }
    var params = {
      userAnnotote_ids: ids,
      delete: 1
    }
    this.utilityMethods.show_loader('');
    this.anototeService.delete_bulk_totes(params).subscribe((result) => {
      this.utilityMethods.hide_loader();
      if (result.data.annotote.length == this.selected_totes.length) {
        for (let tote of this.selected_totes) {
          this.anototes.splice(this.anototes.indexOf(tote), 1);
        }
        this.utilityMethods.doToast("Deleted Successfully.")
        this.close_bulk_actions();
      }
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    })
  }

  tote_privacy() {
    var ids = '';
    for (let anotote of this.selected_totes) {
      if (ids == '')
        ids += anotote.userAnnotote.id
      else
        ids += ',' + anotote.userAnnotote.id
    }
    var params = {
      userAnnotote_ids: ids,
      privacy: 1
    }
    this.utilityMethods.show_loader('', false);
    this.anototeService.privatize_bulk_totes(params).subscribe((result) => {
      this.utilityMethods.hide_loader();
      if (result.data.annotote.length == this.selected_totes.length) {
        for (let tote of this.selected_totes) {
          tote.userAnnotote.privacy = 1;
        }
        this.utilityMethods.doToast("Privacy successfully updated.");
        this.close_bulk_actions();
      }
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    })
  }

  save_totes() {
    var ids = '';
    if (this.current_color == 'follows')
      for (let anotote of this.selected_totes) {
        if (ids == '')
          ids += anotote.userAnnotote.annotote.id
        else
          ids += ',' + anotote.userAnnotote.annotote.id
      }
    else if (this.current_color == 'top')
      for (let anotote of this.selected_totes) {
        if (ids == '')
          ids += anotote.annotote.id
        else
          ids += ',' + anotote.annotote.id
      }

    var params = {
      annotote_id: ids,
      user_id: this.user.id,
      created_at: this.utilityMethods.get_php_wala_time()
    }
    this.utilityMethods.show_loader('', false);
    this.anototeService.save_totes(params).subscribe((result) => {
      this.utilityMethods.hide_loader();
      if (result.status == 1) {
        this.utilityMethods.doToast("Saved.");
        this.close_bulk_actions();
      }
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    })
  }

  bookmark_totes() {
    var ids = '';
    for (let anotote of this.selected_totes) {
      if (ids == '')
        ids += anotote.userAnnotote.id
      else
        ids += ',' + anotote.userAnnotote.id
    }
    var params = {
      user_tote_id: ids,
      user_id: this.user.id,
      created_at: this.utilityMethods.get_php_wala_time()
    }

    this.utilityMethods.show_loader('', false);
    this.anototeService.bookmark_totes(params).subscribe((result) => {
      this.utilityMethods.hide_loader();
      if (result.status == 1) {
        this.utilityMethods.doToast("Bookmarked.");
        this.close_bulk_actions();
      }
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    })

  }

}
