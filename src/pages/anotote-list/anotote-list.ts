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
import { NotificationService } from "../../services/notifications.service";
import { ChatToteOptions } from './chat_tote';
import { Streams } from '../../services/stream.service';

@IonicPage()
@Component({
  selector: 'page-anotote-list',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ webkitTransform: 'translateY(100%)', transform: 'translateY(100%)', opacity: 0 }),
          animate('500ms', style({ webkitTransform: 'translateY(100%)', transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ webkitTransform: 'translateY(0)', transform: 'translateY(0)', opacity: 1 }),
          animate('500ms', style({ webkitTransform: 'translateY(100%)', transform: 'translateY(100%)', opacity: 0 }))
        ])
      ]
    ),
    trigger(
      'leftAnimation', [
        transition(':enter', [
          style({ webkitTransform: 'translateY(-100%)', transform: 'translatex(-100%)', opacity: 0 }),
          animate('500ms', style({ webkitTransform: 'translateY(0%)', transform: 'translatex(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ webkitTransform: 'translateY(0)', transform: 'translatex(0)', opacity: 1 }),
          animate('500ms', style({ left: '0', webkitTransform: 'translateY(-100%)', transform: 'translatex(-100%)', opacity: 0 }))
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
  public unread_notification_count: any = 0;
  public text: any;
  public follow_visited = false;

  /**
   * Constructor
   */
  constructor(public searchService: SearchService, public authService: AuthenticationService, public anototeService: AnototeService, public navCtrl: NavController, public modalCtrl: ModalController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods, private toastCtrl: ToastController, private alertCtrl: AlertController, public notificationService: NotificationService, public stream: Streams) {
    this.current_color = navParams.get('color');
    this.whichStream = navParams.get('color');
    this.reply_box_on = false;
    this.anototes = new Array<ListTotesModel>();
    this.user = authService.getUser();
    this.reorder_highlights = false;
    var data = notificationService.get_notification_data()
    this.unread_notification_count = data.unread;
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
  }

  ionViewDidLeave() {
    // this.anototes = [];
    // this.top_anototes = [];
    if (this.current_active_anotote) {
      this.current_active_anotote.active = false;
    }
  }
  ionViewDidEnter() {
    if (this.infinite_scroll)
      this.infinite_scroll.enable(true);
    /**
     * Set default mode to list not the edit one
     */
    this.edit_mode = false;
    let anototes: Array<ListTotesModel> = [];
    this.current_page = 1;
    this.anototes = [];
    this.current_active_anotote = null;
    this.follow_visited = false;
    if (this.current_color == 'me') {
      if (this.stream.me_first_load) {
        this.anototes = this.stream.me_anototes;
        this.current_page = this.stream.me_page_no;
      } else {
        this.loadanototes();
      }
    } else if (this.current_color == 'follows') {
      if (this.stream.follow_first_load) {
        this.anototes = this.stream.follows_anototes;
        this.current_page = this.stream.follows_page_no;
      } else
        this.loadanototes();
    } else {
      if (this.stream.top_first_load) {
        this.top_anototes = this.stream.top_anototes;
        this.current_page = this.stream.top_page_no;
      } else
        this.loadanototes();
    }
  }

  loadanototes() {
    if (this.current_color != 'top') {
      this.utilityMethods.show_loader('', false);
      this.anototeService.fetchTotes(this.whichStream, this.current_page++).subscribe((result) => {
        let stream = result.data.annototes;
        for (let entry of stream) {
          this.anototes.push(new ListTotesModel(entry.id, entry.type, entry.userToteId, entry.chatGroupId, entry.userAnnotote, entry.chatGroup, entry.createdAt, entry.updatedAt));
        }
        if (this.anototes.length == 0) {
          this.has_totes = false;
        }
        if (this.current_color == 'me') {
          this.stream.me_page_no = this.current_page;
          this.stream.me_anototes = this.anototes;
          this.stream.me_first_load = true;
        } else if (this.current_color == 'follows') {
          this.stream.follows_page_no = this.current_page;
          this.stream.follows_anototes = this.anototes;
          this.stream.follow_first_load = true;
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
        this.stream.top_anototes = this.top_anototes;
        this.stream.top_page_no = this.current_page;
        this.stream.top_first_load = true;
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
      anotote.highlights = Object.assign(anotote.userAnnotote.annototeHeighlights);
      anotote.meFilePath = anotote.userAnnotote.filePath;
      anotote.active_tab = 'me'
    } else if (this.current_color == 'follows' || this.current_color == 'top') {
      if (this.current_color == 'top' && anotote.anototeDetail.meToteFollowTop.id == anotote.userAnnotote.id) {
        anotote.my_highlights = anotote.top_highlights;
        anotote.highlights = Object.assign(anotote.my_highlights);
        anotote.active_tab = 'me'
        anotote.meFilePath = anotote.anototeDetail.userAnnotote.filePath;
      } else if (anotote.my_highlights == undefined) {
        this.me_spinner = true;
        var params = {
          user_id: this.user.id,
          anotote_id: this.current_color == 'follows' ? anotote.userAnnotote.anototeDetail.meToteFollowTop.id : anotote.anototeDetail.meToteFollowTop.id,
          time: this.utilityMethods.get_php_wala_time()
        }
        this.anototeService.fetchToteDetails(params).subscribe((result) => {
          this.me_spinner = false;
          if (result.status == 1) {
            anotote.active_tab = 'me'
            anotote.highlights = Object.assign(result.data.annotote.highlights);
            anotote.my_highlights = result.data.annotote.highlights;
            anotote.meFilePath = result.data.annotote.userAnnotote.filePath;
          } else {
            this.utilityMethods.doToast("Couldn't fetch annotations");
            anotote.active = false;
          }
        }, (error) => {
          this.me_spinner = false;
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          }
        });
      } else {
        anotote.active_tab = 'me';
        anotote.highlights = Object.assign(anotote.my_highlights);
      }
    }
  }

  open_browser(anotote, highlight) {
    if (anotote.userAnnotote.filePath != '') {
      if (this.current_active_highlight == null || this.current_active_highlight.edit == false) {
        if (this.current_color != 'top') {
          if (this.current_color == 'me') {
            anotote.active = false;
            anotote.meFilePath = anotote.userAnnotote.filePath;
            this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'anotote_list', WHICH_STREAM: this.whichStream, HIGHLIGHT_RECEIVED: highlight, actual_stream: this.current_active_anotote.active_tab });
          } else if (this.current_color == 'follows') {
            anotote.active = false;
            if (this.follow_visited == false) {
              anotote.followerFilePath = anotote.followers[0].followTote.filePath
              anotote.followers[0].highlights = anotote.userAnnotote.annototeHeighlights;
            }
            this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'anotote_list', WHICH_STREAM: this.whichStream, HIGHLIGHT_RECEIVED: highlight, actual_stream: this.current_active_anotote.active_tab });
          }
        } else {
          let tote = {
            active: anotote.active,
            userAnnotote: anotote.userAnnotote,
            followers: anotote.follows,
            highlights: anotote.highlights,
            annototeId: anotote.annotote.id,
            anototeDetail: anotote.anototeDetail
          }
          tote.userAnnotote.annotote = anotote.annotote;
          anotote.active = false;
          anotote.topFilePath = anotote.userAnnotote.filePath;
          this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'anotote_list', WHICH_STREAM: this.whichStream, HIGHLIGHT_RECEIVED: highlight, actual_stream: this.current_active_anotote.active_tab });
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
      this.anototeService.fetchTotes(this.whichStream, this.current_page++).subscribe((result) => {
        let stream = result.data.annototes;
        for (let entry of stream) {
          this.anototes.push(new ListTotesModel(entry.id, entry.type, entry.userToteId, entry.chatGroupId, entry.userAnnotote, entry.chatGroup, entry.createdAt, entry.updatedAt));
        }
        infiniteScroll.complete();
        if (stream.length < 10) {
          infiniteScroll.enable(false);
        } else {
          if (this.current_color == 'me') {
            this.stream.me_page_no = this.current_page;
          } else if (this.current_color == 'follows') {
            this.stream.follows_page_no = this.current_page;
          }
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

  doRefresh(refresher) {
    this.current_page = 1;
    this.anototes = [];
    this.current_active_anotote = null;
    this.follow_visited = false;
    this.loadanototes();
    refresher.complete();
    if (this.infinite_scroll)
      this.infinite_scroll.enable(true);
  }

  follows(event) {
    event.stopPropagation();
    this.navCtrl.push(Follows, {});
  }

  open_follows_popup(event, anotote) {
    event.stopPropagation();
    if (anotote.followers.length == 1) {
      anotote.selected_follower_name = anotote.followers[0].firstName;
      anotote.active_tab = 'follows';
      anotote.followerFilePath = anotote.followers[0].followTote.filePath;
      this.follow_visited = true;
      this.loadFollower(anotote, anotote.followers[0])
    } else if (anotote.followers.length > 1) {
      if (this.follow_visited) {
        let anototeOptionsModal = this.modalCtrl.create(FollowsPopup, { follows: anotote.followers });
        anototeOptionsModal.onDidDismiss(data => {
          if (data != null) {
            anotote.selected_follower_name = data.user.firstName;
            anotote.active_tab = 'follows'
            anotote.followerFilePath = data.user.followTote.filePath;
            this.loadFollower(anotote, data.user);
          }
        });
        anototeOptionsModal.present();
      } else {
        anotote.selected_follower_name = anotote.followers[0].firstName;
        anotote.active_tab = 'follows';
        this.follow_visited = true;
        anotote.followerFilePath = anotote.followers[0].followTote.filePath;
        this.loadFollower(anotote, anotote.followers[0])
      }
    } else {
      this.utilityMethods.doToast('No one follows this anotote.');
    }

  }

  loadFollower(anotote, user) {
    if (user.highlights == null) {
      anotote.spinner_for_active = true;
      var params = {
        user_id: user.id,
        anotote_id: user.followTote.id,
        time: this.utilityMethods.get_php_wala_time()
      }
      this.anototeService.fetchToteDetails(params).subscribe((result) => {
        anotote.spinner_for_active = false;
        user.highlights = result.data.annotote.highlights;
        anotote.highlights = Object.assign(result.data.annotote.highlights);
      }, (error) => {
        anotote.spinner_for_active = false;
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
    } else {
      anotote.highlights = Object.assign(user.highlights);
    }
  }

  top_follows_popup(event, anotote) {
    event.stopPropagation();
    if (anotote.follows.length == 1) {
      anotote.selected_follower_name = anotote.follows[0].firstName;
      anotote.active_tab = 'follows';
      anotote.followerFilePath = anotote.follows[0].followTote.filePath;
      this.loadFollower(anotote, anotote.follows[0])
    } else if (anotote.follows.length > 1) {
      if (this.follow_visited) {
        let anototeOptionsModal = this.modalCtrl.create(FollowsPopup, { follows: anotote.follows });
        anototeOptionsModal.onDidDismiss(data => {
          if (data != null) {
            anotote.selected_follower_name = data.user.firstName;
            anotote.active_tab = 'follows'
            anotote.followerFilePath = data.user.followTote.filePath;
            this.loadFollower(anotote, data.user);
          }
        });
        anototeOptionsModal.present();
      } else {
        anotote.selected_follower_name = anotote.followers[0].firstName;
        anotote.active_tab = 'follows';
        anotote.followerFilePath = anotote.follows[0].followTote.filePath;
        this.loadFollower(anotote, anotote.follows[0])
      }
    } else {
      this.utilityMethods.doToast('No one follows this anotote.');
    }

  }

  show_top_tab(anotote) {
    if (anotote.top_highlights == undefined) {
      if (anotote.userAnnotote.id != anotote.topUserToteId) {
        this.top_spinner = true;
        var params = {
          user_id: this.user.id,
          anotote_id: anotote.topUserToteId,
          time: this.utilityMethods.get_php_wala_time()
        }
        this.anototeService.fetchToteDetails(params).subscribe((result) => {
          this.top_spinner = false;
          anotote.active_tab = 'top'
          anotote.topFilePath = result.data.annotote.userAnnotote.filePath;
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
        anotote.top_highlights = anotote.userAnnotote.annototeHeighlights;
        anotote.active_tab = 'top';
        anotote.topFilePath = anotote.userAnnotote.filePath;
      }
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
    if (this.current_active_anotote != null && this.current_color != 'top') {
      if (this.current_active_anotote.chatGroup == null)
        if (this.current_active_anotote.userAnnotote.filePath != '') {
          // this.navCtrl.push(AnototeEditor, { ANOTOTE: this.current_active_anotote, FROM: 'anotote_list', WHICH_STREAM: this.whichStream, HIGHLIGHT_RECEIVED: this.current_active_highlight });
          this.go_to_chat_tote();
        } else
          this.utilityMethods.doToast("Couldn't load as no file was found.");
      else
        this.go_to_chat_thread(this.current_active_anotote);
    } else {
      this.go_to_chat_tote();
    }
  }

  go_to_chat_tote() {
    var params = {
      anotote: this.current_active_anotote,
      stream: this.current_color
    }
    let chatTote = this.modalCtrl.create(ChatToteOptions, params);
    chatTote.onDidDismiss((data) => {
      if (data.chat) {
        if (data.title)
          this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: true, anotote_id: this.current_active_anotote.userAnnotote.annototeId, title: data.title, full_tote: this.current_active_anotote });
        else
          this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: false, anotote_id: null, title: '' });
      } else if (data.save) {
        if (this.current_color == 'me') {
          this.navCtrl.push(AnototeEditor, { ANOTOTE: this.current_active_anotote, FROM: 'anotote_list', WHICH_STREAM: this.whichStream, HIGHLIGHT_RECEIVED: null, actual_stream: this.current_active_anotote.active_tab });
        } else {
          if (this.current_active_anotote.userAnnotote.filePath != '') {
            var params: any = {
              annotote_id: this.current_color == 'follows' ? this.current_active_anotote.userAnnotote.annotote.id : this.current_active_anotote.annotote.id,
              user_id: this.current_color == 'follows' ? this.current_active_anotote.userAnnotote.anototeDetail.user.id : this.current_active_anotote.anototeDetail.user.id,
              created_at: this.utilityMethods.get_php_wala_time()
            }
            this.utilityMethods.show_loader('', false);
            this.anototeService.save_totes(params).subscribe((result) => {
              this.utilityMethods.hide_loader();
              if (result.status == 1) {
                this.stream.me_first_load = false;
                this.stream.top_first_load = false;
                this.stream.follow_first_load = false;
                this.utilityMethods.doToast("Saved to Me stream");
                this.navCtrl.push(AnototeEditor, { ANOTOTE: this.current_active_anotote, FROM: 'anotote_list', WHICH_STREAM: this.whichStream, HIGHLIGHT_RECEIVED: null, actual_stream: this.current_active_anotote.active_tab });
              }
            }, (error) => {
              this.utilityMethods.hide_loader();
              if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
              }
            })
          } else {
            this.utilityMethods.doToast("Couldn't load as no file was found.");
          }
        }
      } else if (data.bookmark) {
        var link = [];
        link.push(this.current_color == 'follows' ? this.current_active_anotote.userAnnotote.annotote.link : this.current_active_anotote.annotote.link)
        var params: any = {
          user_tote_id: this.current_color == 'follows' ? this.current_active_anotote.userAnnotote.annotote.id : this.current_active_anotote.annotote.id,
          user_id: this.user.id,
          links: link,
          created_at: this.utilityMethods.get_php_wala_time()
        }
        this.utilityMethods.show_loader('Bookmarking', false);
        this.anototeService.bookmark_totes(params).subscribe((result) => {
          this.utilityMethods.hide_loader();
          if (result.status == 1) {
            if (result.data.bookmarks.length > 0)
              this.searchService.saved_searches.unshift(result.data.bookmarks[0]);
            this.utilityMethods.doToast("Bookmarked.");
          }
        }, (error) => {
          this.utilityMethods.hide_loader();
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          } else {
            this.utilityMethods.doToast("Couldn't bookmark.");
          }
        })
      }
    })
    chatTote.present();
  }

  //generic for all three streams
  openAnototeDetail(anotote) {
    this.reorder_highlights = false;
    if (this.current_color != 'top') {
      if (!this.edit_mode) {
        //anotation tabs logic
        if (this.current_color == 'me') {
          anotote.active_tab = 'me';
          if (anotote.chatGroupId == null)
            anotote.highlights = Object.assign(anotote.userAnnotote.annototeHeighlights);
        } else if (this.current_color == 'follows') {
          anotote.active_tab = 'follows'
          anotote.highlights = Object.assign(anotote.userAnnotote.annototeHeighlights);
        }
        //-----
        if (this.current_active_anotote) {
          this.current_active_anotote.active = false;
          if (this.current_active_highlight) {
            this.current_active_highlight.edit = false;
          }
          if (this.current_active_anotote.id == anotote.id) {
            this.current_active_anotote = null;
            return;
          }
        }
        this.current_active_anotote = anotote;
        this.current_active_anotote.active = !this.current_active_anotote.active;

        // if (this.current_active_anotote.type == 1 && this.whichStream == 'me') {
        //   this.current_active_anotote.activeParty = 1;
        //   //this.setSimpleToteDetails(anotote);
        // } else if (this.current_active_anotote.type == 1 && this.whichStream == 'follows') {
        //   this.current_active_anotote.activeParty = 2;
        //   //this.setSimpleToteDetails(anotote);
        // } else if (this.current_active_anotote.type == 2 && this.whichStream == 'me') {
        //   // this.getQuickChatHistory(anotote);
        // }
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
        if (anotote.anototeDetail.follows.length > 0)
          anotote.selected_follower_name = anotote.anototeDetail.follows[0].firstName;
        anotote.follows = anotote.anototeDetail.follows;
        anotote.top_highlights = Object.assign(anotote.anototeDetail.highlights);
        anotote.highlights = anotote.top_highlights;
        anotote.isMe = anotote.anototeDetail.isMe;
        anotote.spinner_for_active = false;
        //Details
        // this.spinner_for_active = true;
        // var params = {
        //   user_id: this.user.id,
        //   anotote_id: anotote.userAnnotote.id,
        //   time: this.utilityMethods.get_php_wala_time()
        // }
        // this.anototeService.fetchToteDetails(params).subscribe((result) => {
        //   this.spinner_for_active = false;
        //   if (result.status == 1) {
        //     if (result.data.annotote.follows.length > 0)
        //       anotote.selected_follower_name = result.data.annotote.follows[0].firstName;
        //     anotote.follows = result.data.annotote.follows;
        //     anotote.top_highlights = Object.assign(result.data.annotote.highlights);
        //     anotote.highlights = result.data.annotote.highlights;
        //     anotote.isMe = result.data.annotote.isMe;
        //   } else {
        //     this.utilityMethods.doToast("Couldn't fetch annotations");
        //     anotote.active = false;
        //   }
        // }, (error) => {
        //   this.spinner_for_active = false;
        //   if (error.code == -1) {
        //     this.utilityMethods.internet_connection_error();
        //     this.utilityMethods.doToast("Couldn't load chat history.");
        //   }
        // });
      }
    }
  }

  public getQuickChatHistory(tote) {
    tote.spinner_for_active = true;
    this.messages = [];
    var param;
    if (tote.chatGroup.groupUsers[0].user.id == this.user.id)
      param = tote.chatGroup.groupUsers[1].user.id;
    else
      param = tote.chatGroup.groupUsers[0].user.id;
    this.anototeService.quickChat(param).subscribe((result) => {
      tote.spinner_for_active = false;
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
    if (this.current_color == 'me' && this.current_active_anotote.active_tab == 'me') {
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

  stop_editing(event, highlight) {
    event.stopPropagation();
    highlight.edit = false;
  }

  delete_annotation(annotation) {
    this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to delete this annotation?", () => {
      this.utilityMethods.show_loader('Deleting')
      this.searchService.get_anotote_content(this.current_active_anotote.userAnnotote.filePath)
        .subscribe((response_content) => {
          this.text = response_content.text();
          setTimeout(() => {
            var highlight_quote: any = document.getElementById(annotation.identifier);
            highlight_quote.replaceWith(highlight_quote.innerText);
            var params = {
              user_annotate_id: this.current_active_anotote.userAnnotote.id,
              identifier: annotation.identifier,
              file_text: document.getElementById('temp_text_editor').innerHTML,
              delete: 1
            }
            this.anototeService.delete_annotation(params).subscribe((result) => {
              this.utilityMethods.hide_loader()
              this.current_active_anotote.highlights.splice(this.current_active_anotote.highlights.indexOf(annotation), 1);
              this.current_active_highlight = null;
              this.stream.top_first_load = false;
            }, (error) => {
              if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
              } else {
                this.utilityMethods.doToast("Couldn't delete annotation.");
              }
            })
          }, 500)
        }, (error) => {
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          } else {
            this.utilityMethods.doToast("Couldn't save annotation.");
          }
        });
    })
  }

  show_tags_for_annotation(event, activeTab, annotation) {
    event.stopPropagation();
    if (activeTab != 'me' && annotation.tags.length == 0) {
      this.utilityMethods.doToast("This annotation does not contain any tags.");
      return;
    }
    var params = {
      annotation_id: annotation.id,
      tags: annotation.tags,
      whichStream: activeTab,
      annotote: false
    }
    let tagsModal = this.modalCtrl.create(TagsPopUp, params);
    tagsModal.present();

  }

  save_edited_annotation(highlight) {
    if (this.edit_highlight_text != highlight.comment && this.edit_highlight_text != '') {
      this.utilityMethods.show_loader("");
      this.searchService.get_anotote_content(this.current_active_anotote.userAnnotote.filePath)
        .subscribe((response_content) => {
          this.text = response_content.text();
          setTimeout(() => {
            var highlight_quote = document.getElementById(highlight.identifier);
            highlight_quote.className = "highlight_comment"
            highlight_quote.setAttribute("data-comment", this.edit_highlight_text);

            var params = {
              highlight_text: highlight.highlightText,
              updated_at: this.utilityMethods.get_php_wala_time(),
              file_text: document.getElementById('temp_text_editor').innerHTML,
              comment: this.edit_highlight_text,
              identifier: highlight.identifier,
              user_tote_id: this.current_active_anotote.userAnnotote.id
            }
            this.anototeService.update_annotation(params).subscribe((result) => {
              this.utilityMethods.hide_loader();
              highlight.comment = result.data.highlight.comment;
              highlight.edit = false;
              this.current_active_highlight = null;
              this.text = '';
              this.stream.top_first_load = false;
            }, (error) => {
              if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
              } else {
                this.utilityMethods.doToast("Couldn't update annotation.");
              }
            })
          }, 500)
        }, (error) => {
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          } else {
            this.utilityMethods.doToast("Couldn't save annotation.");
          }
        });
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

  go_to_chat_thread(anotote) {
    let secondUser: any = null;
    for (let group of anotote.chatGroup.groupUsers) {
      if (group.user.id != this.user.id) {
        secondUser = group.user;
      }
    }
    var against = false;
    if (anotote.chatGroup.messagesUser[0].anototeId != 0)
      against = true;
    this.navCtrl.push(Chat, { secondUser: secondUser, against_anotote: against, anotote_id: anotote.chatGroup.messagesUser[0].anototeId, title: anotote.chatGroup.messagesUser[0].subject, full_tote: anotote });
  }

  presentAnototeOptionsModal(event, anotote) {
    event.stopPropagation();
    if (anotote.chatGroup == null) {
      var params = {
        anotote: anotote,
        whichStream: this.current_color
      }
      let anototeOptionsModal = this.modalCtrl.create(AnototeOptions, params);
      anototeOptionsModal.onDidDismiss(data => {
        if (data.tags) {
          if (this.current_color != 'top') {
            var params = {
              user_tote_id: anotote.userAnnotote.id,
              tags: anotote.userAnnotote.annototeTags,
              whichStream: this.current_color,
              annotote: true
            }
            let tagsModal = this.modalCtrl.create(TagsPopUp, params);
            tagsModal.present();
          } else if (this.current_color == 'top') {
            var params = {
              user_tote_id: anotote.userAnnotote.id,
              tags: anotote.tags,
              whichStream: this.current_color,
              annotote: true
            }
            let tagsModal = this.modalCtrl.create(TagsPopUp, params);
            tagsModal.present();
          }
        } else if (data.delete == true) {
          this.current_active_anotote = null;
          this.anototes.splice(this.anototes.indexOf(anotote), 1);
        }
      });
      anototeOptionsModal.present();
    } else {
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

  openSearchPopup() {
    var url = '';
    if (this.current_active_anotote != null && this.current_active_anotote.userAnnotote && (this.current_color == 'me' || this.current_color == 'follows'))
      url = this.current_active_anotote.userAnnotote.annotote.link;
    else if (this.current_active_anotote != null && this.current_color == 'top') {
      url = this.current_active_anotote.annotote.link;
    } else {
      this.statusBar.backgroundColorByHexString('#252525');
    }
    let searchModal = this.modalCtrl.create(Search, { link: url, stream: this.current_color, from: 'list' });
    searchModal.onDidDismiss((data) => {
      if (this.current_active_anotote == null) {
        if (this.current_color == 'me')
          this.statusBar.backgroundColorByHexString('#3bde00');
        else if (this.current_color == 'follows')
          this.statusBar.backgroundColorByHexString('#f4e300');
        else
          this.statusBar.backgroundColorByHexString('#fb9df0');
      }
      if (data)
        if (data.userAnnotote.anototeType == 'me')
          this.navCtrl.push(AnototeEditor, { ANOTOTE: data, FROM: 'search', WHICH_STREAM: data.userAnnotote.anototeType, actual_stream: data.userAnnotote.anototeType });
        else
          this.navCtrl.push(AnototeEditor, { ANOTOTE: data, FROM: 'search', WHICH_STREAM: 'anon', actual_stream: 'anon' });
    });
    searchModal.present();
  }

  presentViewOptionsModal() {
    var params = {
      anotote: this.current_active_anotote,
      stream: this.current_color
    }
    let viewsOptionsModal = this.modalCtrl.create(ViewOptions, params);
    viewsOptionsModal.onDidDismiss((preference) => {
      if (preference.tab_selected == 'me')
        this.showMeHighlights(this.current_active_anotote);
      else if (preference.tab_selected == 'follows' && this.current_color != 'top')
        this.open_follows_popup(event, this.current_active_anotote);
      else if (preference.tab_selected == 'follows' && this.current_color == 'top')
        this.top_follows_popup(event, this.current_active_anotote);
      else if (preference.tab_selected == 'top')
        this.show_top_tab(this.current_active_anotote);
    })
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
    var links = [];
    for (let anotote of this.selected_totes) {
      if (ids == '')
        ids += anotote.userAnnotote.id
      else
        ids += ',' + anotote.userAnnotote.id
      links.push(this.current_color == 'follows' ? anotote.userAnnotote.annotote.link : anotote.annotote.link)
    }
    var params = {
      user_tote_id: ids,
      user_id: this.user.id,
      links: links,
      created_at: this.utilityMethods.get_php_wala_time()
    }
    this.utilityMethods.show_loader('', false);
    this.anototeService.bookmark_totes(params).subscribe((result) => {
      this.utilityMethods.hide_loader();
      if (result.status == 1) {
        this.utilityMethods.doToast("Bookmarked.");
        if (result.data.bookmarks.length > 0)
          for (let bookmark of result.data.bookmarks) {
            this.searchService.saved_searches.unshift(bookmark);
          }
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
