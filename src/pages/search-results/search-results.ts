import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams, Content } from 'ionic-angular';
import { AnototeEditor } from '../anotote-editor/anotote-editor';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { AuthenticationService } from '../../services/auth.service';
import { Profile } from "../follows/follows_profile";
import { StatusBar } from "@ionic-native/status-bar";
import { Streams } from '../../services/stream.service';
import { AnototeOptions } from "../anotote-list/tote_options";
import { ViewOptions } from "../anotote-list/view_options";
import { TagsPopUp } from "../anotote-list/tags";
import { ChatToteOptions } from "../anotote-list/chat_tote";
import { Chat } from "../chat/chat";
import { FollowsPopup } from "../anotote-list/follows_popup";
import { AnototeService } from "../../services/anotote.service";
import { TagsExclusive } from '../tagsExclusive/tags';
import { ChatService } from '../../services/chat.service';
import { Keyboard } from '@ionic-native/keyboard';

@Component({
  selector: 'search-results',
  templateUrl: 'search-results.html',
})
export class SearchResults {
  @ViewChild(Content) content: Content;
  private search_term: string;
  private _loading: boolean = false;
  private search_results: any = [];
  private saved_search_result: any = [];
  public totes = [];
  public chats = [];
  public users = [];
  private user;
  private show_search_field: boolean = false;
  private hide_header_contents: boolean = false;
  private no_search: boolean = false;
  public current_active_anotote;
  public move_fab = false;
  public current_active_highlight;
  public follow_visited = false;
  public filter_mode: boolean = false;
  private search_filters = {
    media: {
      tote: false,
      user: false,
      chat: false
    },
    category: {
      me: false,
      follows: false,
      top: false
    },
    date: {
      year: null,
      month: null,
      day: null
    }
  }
  public edit_highlight_text: string = '';
  public edit_actual_highlight: string = '';
  private reorder_highlights: boolean = false;
  public nameInputIndex: number = 0;
  public text: any;
  public title_temp = '';
  public reordering_data = null;
  public resizer: boolean = false;

  constructor(public stream: Streams,
    public authService: AuthenticationService,
    public searchService: SearchService,
    public anototeService: AnototeService,
    private params: NavParams,
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public cd: ChangeDetectorRef,
    public chatService: ChatService,
    public key: Keyboard,
    public utilityMethods: UtilityMethods,
    public statusBar: StatusBar) {
    this.key.disableScroll(true);
    this.user = this.authService.getUser();
    // this.show_search();

  }

  ionViewDidLeave() {
    this.key.disableScroll(false);
  }

  clear() {
    this.search_term = '';
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() {
    setTimeout(() => {
      this.search_term = this.params.get('search_term');
      var results = this.params.get('results');
      this.search_results = results;
      this.saved_search_result = results;
      for (let tote of results) {
        if (tote.is_tote == true) {
          this.totes.push(tote);
        } else if (tote.isChat == true && tote.is_tote == false) {
          this.chats.push(tote);
        } else {
          this.users.push(tote);
        }
      }
      if (this.search_results.length == 0)
        this.no_search = true;
    }, 1000);
  }

  ionViewDidEnter() {
    this.statusBar.backgroundColorByHexString('#323232');
    if (this.current_active_anotote) {
      if (this.current_active_anotote.chatGroup == null) {
        this.move_fab = false;
        if (this.current_active_anotote.userAnnotote.active_tab == 'follows' || this.current_active_anotote.userAnnotote.active_tab == 'top') {
          this.move_fab = false;
          this.resizer = true;
        }
      } else {
        this.move_fab = false;
        this.resizer = true;
      }
    }
  }

  // show_search() {
  //   if (this.show_search_field) {
  //     this.show_search_field = false;
  //     let timeoutId = setTimeout(() => {
  //       this.hide_header_contents = false;
  //     }, 1000);
  //   } else {
  //     this.show_search_field = true;
  //     this.hide_header_contents = true;
  //   }
  // }

  go_to_browser(anotote, highlight) {
    this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote.userAnnotote, FROM: 'search_result', WHICH_STREAM: 'anon', HIGHLIGHT_RECEIVED: highlight, actual_stream: anotote.userAnnotote.active_tab });
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
    this.navCtrl.push(Chat, { secondUser: secondUser, against_anotote: against, anotote_id: anotote.chatGroup.messagesUser[0].anototeId, title: anotote.chatGroup.messagesUser[0].subject, full_tote: anotote, color: 'me' });
  }

  load_search_results() {
    this.search_results = [];
    this.saved_search_result = [];
    this.totes = [];
    this.chats = [];
    this.users = [];
    this.no_search = false;
    this._loading = true;
    var params = {
      term: this.search_term,
      type: '',
      annotote_type: '',
      time: 0
    }
    //type filter
    if (this.search_filters.media.tote)
      params.type = 'annotote';

    if (this.search_filters.category.me)
      params.annotote_type = 'me';
    else if (this.search_filters.category.follows)
      params.annotote_type = 'follows';
    else if (this.search_filters.category.top) {
      params.annotote_type = 'top';
      params.time = this.utilityMethods.get_php_wala_time() - 31536000;
    }

    //date filter
    if (this.search_filters.date.year != null && this.search_filters.date.month != null && this.search_filters.date.day != null) {
      if (this.search_filters.date.month < 12 && this.search_filters.date.month > 0 && this.search_filters.date.day < 31 && this.search_filters.date.day > 0)
        params.time = this.utilityMethods.get_time(this.search_filters.date.day + '/' + this.search_filters.date.month + '/' + this.search_filters.date.year);
      else {
        this.utilityMethods.doToast("Please enter a valid date");
        return;
      }
    }

    if (this.search_filters.media.user)
      params.type = 'user';
    if (this.search_filters.media.chat) {
      params.annotote_type = 'chats'
    }

    this.searchService.general_search(params)
      .subscribe((response) => {
        this._loading = false;
        if (response.status == 1) {
          var manipulated = this.searchService.responseManipulation(response);
          this.search_results = manipulated.search_results;
          this.totes = manipulated.totes;
          this.chats = manipulated.chats;
          this.users = manipulated.users;
          // this.saved_search_result = JSON.parse(JSON.stringify(this.search_results));
          Object.assign(this.saved_search_result, this.search_results)
          if (this.search_results.length == 0)
            this.no_search = true;
        }
      }, (error) => {
        this.search_results = [];
        this._loading = false;
        this.no_search = true;
      });
  }

  followUser(event, person) {
    event.stopPropagation();
    let self = this;
    var current_time = this.utilityMethods.get_php_wala_time();
    person.follow_loading = true;
    this.searchService.follow_user({
      created_at: current_time,
      follows_id: person.id
    }).subscribe((response) => {
      person.follow_loading = false;
      this.stream.follow_first_load = false;
      this.stream.me_first_load = false;
      this.stream.top_first_load = false;
      if (response.status == 1)
        person.isFollowed = 1;
      else
        this.utilityMethods.doToast("Couldn't follow.");
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    });
  }

  showProfile(search_result) {
    let profile = this.modalCtrl.create(Profile, {
      data: search_result.id,
      from_page: 'search_results'
    });
    profile.onDidDismiss(data => {
    });
    profile.present();

  }

  openAnototeDetail(event: Event, anotote) {
    event.stopPropagation();
    if (this.resizer)
      this.content.resize();
    this.reorder_highlights = false;
    if (this.current_active_anotote && this.current_active_anotote.checked == false) {
      this.current_active_anotote.active = false;
      this.current_active_anotote.checked = false;
      if (anotote.chatGroup == null) {
        // if (anotote.userAnnotote && this.current_active_anotote.chatGroup == null && this.current_active_anotote.userAnnotote.id == anotote.userAnnotote.id)
        //   this.move_fab = false;
        // else if(this.current_active_anotote.chatGroup){

        // }
        if (this.current_active_highlight) {
          this.current_active_highlight.edit = false;
        }
        if (this.current_active_anotote.chatGroup == null && this.current_active_anotote.userAnnotote.userAnnotote.id == anotote.userAnnotote.userAnnotote.id) {
          this.current_active_anotote = null;
          this.move_fab = false;
          return;
        }
      } else {
        anotote.active_tab = 'me';
        this.move_fab = false;
        if (this.current_active_anotote.chatGroup && anotote.chatGroup.id == this.current_active_anotote.chatGroup.id) {
          this.current_active_anotote = null;
          this.move_fab = false;
          return;
        }
      }
    }
    if (anotote.chatGroup) {
      anotote.active_tab = 'me';
    } else
      if (anotote.userAnnotote.active_tab != 'me')
        this.move_fab = true;
    this.current_active_anotote = anotote;
    if (this.current_active_anotote.checked == false)
      this.current_active_anotote.active = !this.current_active_anotote.active;
  }

  enable_list_reorder(event, highlight) {
    event.stopPropagation();
    if (this.current_active_anotote.userAnnotote.active_tab == 'me') {
      this.reorder_highlights = true;
      highlight.edit = false;
      this.move_fab = true;
      // this.enable_refresher = false;
      this.cd.detectChanges();
    }
  }

  reorderItems(indexes, anotote) {
    let element = anotote.userAnnotote.highlights[indexes.from];
    anotote.userAnnotote.highlights.splice(indexes.from, 1);
    anotote.userAnnotote.highlights.splice(indexes.to, 0, element);

    var _anotation_ids = "", _orders = "", counter = 1;
    for (let highlight of anotote.userAnnotote.highlights) {
      _anotation_ids += highlight.id + ",";
      _orders += counter + ",";
      counter++;
    }
    if (_anotation_ids.length > 0)
      _anotation_ids = _anotation_ids.slice(0, -1);
    if (_orders.length > 0)
      _orders = _orders.slice(0, -1);
    this.reordering_data = {
      orders: _orders,
      ids: _anotation_ids
    }
    // this.searchService.reorder_anotation({ annotation_ids: _anotation_ids, order: _orders })
    //   .subscribe((res) => {
    //     this.enable_refresher = true;
    //     this.reorder_highlights = false;
    //     this.move_fab = false;
    //     this.toastInFooter("Order Updated");
    //   }, (error) => {
    //     this.enable_refresher = true;
    //   });
  }

  reorderPlease() {
    if (this.reordering_data != null)
      this.searchService.reorder_anotation({ annotation_ids: this.reordering_data.ids, order: this.reordering_data.orders })
        .subscribe((res) => {
          this.reorder_highlights = false;
          this.move_fab = false;
          this.reordering_data = null;
          this.utilityMethods.doToast("Order Updated");
        }, (error) => {
        });
    else
      this.utilityMethods.doToast("Please reorder highlight first");
  }

  disable_reorder() {
    this.reorder_highlights = false;
    this.move_fab = false;
    this.cd.detectChanges();
    this.content.resize();
  }

  chat_participants_from_tote(event, anotote) {
    event.stopPropagation();
    var users = [];
    for (let group of anotote.chatGroup.groupUsers) {
      users.push(group.user);
    }
    let anototeOptionsModal = this.modalCtrl.create(FollowsPopup, { follows: users, participant: true });
    anototeOptionsModal.onDidDismiss(data => {
    });
    anototeOptionsModal.present();
  }

  presentMessageOptions(message, anotote) {
    this.presentAnototeOptionsModal(null, anotote, message)
  }

  presentAnototeOptionsModal(event, anotote, message = null) {
    if (event)
      event.stopPropagation();
    var params = {
      anotote: anotote.chatGroup == null ? anotote.userAnnotote : anotote,
      whichStream: 'search',
      active_tab: anotote.chatGroup == null ? anotote.userAnnotote.active_tab : 'me'
    }
    if (message != null)
      params["message"] = message;
    anotote.moreOptions = true;
    let anototeOptionsModal = this.modalCtrl.create(AnototeOptions, params);
    anototeOptionsModal.onDidDismiss(data => {
      anotote.moreOptions = false;
      if (data.tags) {
        if (anotote.chatGroup == null) {
          var params = {
            user_tote_id: anotote.userAnnotote.userAnnotote.id,
            tags: anotote.userAnnotote.userAnnotote.tags,
            whichStream: anotote.userAnnotote.active_tab,
            annotote: true
          }
          let tagsModal = this.modalCtrl.create(TagsPopUp, params);
          tagsModal.present();
        } else {
          if (message == null) {
            var paramsObj = {
              chatId: anotote.chatGroup.id,
              tags: anotote.chatGroup.chatTags,
              whichStream: 'chat',
              chatOrTxt: true,
              participants: anotote.chatGroup.groupUsers
            }
          } else {
            var paramsObj = {
              chatId: message.id,
              tags: message.messageTags,
              whichStream: 'chat',
              chatOrTxt: false,
              participants: anotote.chatGroup.groupUsers
            }
          }
          let tagsModal = this.modalCtrl.create(TagsPopUp, paramsObj);
          tagsModal.present();
        }
      } else if (data.delete == true) {
        if (message == null) {
          this.stream.top_first_load = false;
          this.stream.follow_first_load = false;
          this.stream.me_first_load = false;
          anotote.userAnnotote.isMe = 0;
          if (anotote.userAnnotote.isTop == 0 && anotote.userAnnotote.follows.length == 0)
            this.search_results.splice(this.search_results.indexOf(anotote), 1);
          else if (anotote.userAnnotote.isTop == 1)
            this.show_top_tab(anotote.userAnnotote);
          else if (anotote.userAnnotote.follows.length > 0) {
            this.follow_visited = false;
            this.follows_popup(null, anotote.userAnnotote);
          }
        } else {
          anotote.chatGroup.messagesUser.splice(anotote.chatGroup.messagesUser.indexOf(message), 1);
        }
      } else if (data.chat) {
        if (anotote.chatGroup == null) {
          var chatParams = {
            anotote: anotote.userAnnotote,
            stream: 'anon',
            findChatter: true,
            doChat: true
          }
          let chatTote = this.modalCtrl.create(ChatToteOptions, chatParams);
          chatTote.onDidDismiss((data) => {
            if (data.chat) {
              if (data.title)
                this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: true, anotote_id: anotote.userAnnotote.userAnnotote.id, title: data.title, full_tote: anotote.userAnnotote });
              else
                this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: false, anotote_id: null, title: '' });
            }
          })
          chatTote.present();
        } else {
          this.go_to_chat_thread(anotote)
        }
      } else if (data.toggle) {
        this.showMeHighlights(anotote.userAnnotote);
      }
    });
    anototeOptionsModal.present();
  }

  presentViewOptionsModal() {

    var params = {
      anotote: this.current_active_anotote != null ? this.current_active_anotote.userAnnotote : null,
      stream: 'anon'
    }
    let viewsOptionsModal = this.modalCtrl.create(ViewOptions, params);
    viewsOptionsModal.onDidDismiss((preference) => {
      if (preference.tab_selected == 'me')
        this.showMeHighlights(this.current_active_anotote.userAnnotote);
      else if (preference.tab_selected == 'follows')
        this.follows_popup(event, this.current_active_anotote.userAnnotote);
      // else if (preference.tab_selected == 'top')
      //   this.show_top_tab(this.current_active_anotote);
    })
    viewsOptionsModal.present();

  }

  follows_popup(event, anotote) {
    if (event)
      event.stopPropagation();
    if (anotote.follows.length == 1) {
      anotote.selected_follower_name = anotote.follows[0].firstName;
      anotote.active_tab = 'follows';
      this.follow_visited = true;
      this.move_fab = true;
      anotote.followerFilePath = anotote.follows[0].followTote.filePath;
      anotote.follower_tags = anotote.follows[0].followTote.tags;
      this.loadFollower(anotote, anotote.follows[0])
    } else if (anotote.follows.length > 1) {
      this.move_fab = true;
      if (this.follow_visited) {
        let anototeOptionsModal = this.modalCtrl.create(FollowsPopup, { follows: anotote.follows });
        anototeOptionsModal.onDidDismiss(data => {
          if (data != null) {
            anotote.selected_follower_name = data.user.firstName;
            anotote.active_tab = 'follows'
            anotote.followerFilePath = data.user.followTote.filePath;
            anotote.follower_tags = data.user.followTote.tags;
            this.cd.detectChanges();
            this.loadFollower(anotote, data.user);
          }
        });
        anototeOptionsModal.present();
      } else {
        anotote.selected_follower_name = anotote.follows[0].firstName;
        anotote.active_tab = 'follows';
        this.follow_visited = true;
        this.move_fab = true;
        anotote.followerFilePath = anotote.follows[0].followTote.filePath;
        anotote.follower_tags = anotote.follows[0].followTote.tags;
        this.loadFollower(anotote, anotote.follows[0])
      }
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

  showMeHighlights(anotote) {
    if (anotote.my_highlights) {
      anotote.highlights = Object.assign(anotote.my_highlights);
      anotote.active_tab = 'me';
      this.move_fab = false;
    } else {
      var params = {
        user_id: this.user.id,
        anotote_id: anotote.meToteFollowTop.id,
        time: this.utilityMethods.get_php_wala_time()
      }
      this.anototeService.fetchToteDetails(params).subscribe((result) => {
        this.move_fab = false;
        if (result.status == 1) {
          anotote.isMe = 1;
          anotote.active_tab = 'me'
          this.move_fab = false;
          anotote.highlights = Object.assign(result.data.annotote.highlights);
          anotote.my_highlights = result.data.annotote.highlights;
          anotote.meFilePath = result.data.annotote.userAnnotote.filePath;
        } else {
          // this.toastInFooter("Couldn't fetch annotations");
          anotote.active = false;
        }
      }, (error) => {
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });

    }
  }

  show_top_tab(anotote) {
    if (anotote.top_highlights == undefined) {
      var params = {
        user_id: this.user.id,
        anotote_id: anotote.topUserToteId,
        time: this.utilityMethods.get_php_wala_time()
      }
      this.anototeService.fetchToteDetails(params).subscribe((result) => {
        this.move_fab = true;
        anotote.active_tab = 'top'
        anotote.topFilePath = result.data.annotote.userAnnotote.filePath;
        anotote.top_tags = result.data.annotote.userAnnotote.tags;
        anotote.topVote = {
          currentUserVote: result.data.annotote.userAnnotote.currentUserVote,
          rating: result.data.annotote.userAnnotote.rating,
          isCurrentUserVote: result.data.annotote.userAnnotote.isCurrentUserVote
        }
        if (result.status == 1) {
          anotote.highlights = Object.assign(result.data.annotote.highlights);
          anotote.top_highlights = result.data.annotote.highlights;
        }
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      })
    } else {
      this.move_fab = true;
      anotote.active_tab = 'top'
      anotote.highlights = Object.assign(anotote.top_highlights);
    }
  }

  show_filters() {
    this.filter_mode = !this.filter_mode;
  }

  anotote_or_user_filter(choice) {
    if (choice == 'tote') {
      if (this.search_filters.media.tote) {
        this.search_filters.media.tote = false;
        this.search_results = this.saved_search_result;
      } else {
        this.search_filters.media.tote = true;
        this.search_filters.media.user = false;
        this.search_filters.media.chat = false;
        this.search_results = this.totes;
      }
      if (this.search_filters.category.me)
        this.category_filter('me');
      else if (this.search_filters.category.follows)
        this.category_filter('follows');
      else if (this.search_filters.category.top)
        this.category_filter('top');
    } else if (choice == 'user') {
      if (this.search_filters.media.user) {
        this.search_filters.media.user = false;
        this.search_results = this.saved_search_result;
      } else {
        this.search_filters.media.user = true;
        this.search_filters.media.tote = false;
        this.search_filters.media.chat = false;
        this.search_results = this.users;
      }
    } else {
      if (this.search_filters.media.chat) {
        this.search_filters.media.chat = false;
        this.search_results = this.saved_search_result;
      } else {
        this.search_filters.media.user = false;
        this.search_filters.media.tote = false;
        this.search_filters.media.chat = true;
        this.search_results = this.chats;
      }
    }
    if (this.search_results.length == 0)
      this.no_search = true;
    else
      this.no_search = false;
  }

  category_filter(choice) {
    if (choice == 'me') {
      if (this.search_filters.category.me) {
        this.search_filters.category.me = false;
        if (this.search_filters.media.tote == true) {
          this.search_results = JSON.parse(JSON.stringify(this.totes));
        } else {
          this.search_results = JSON.parse(JSON.stringify(this.saved_search_result));
        }
      } else {
        this.search_filters.category.me = true;
        this.search_filters.category.follows = false;
        this.search_filters.category.top = false;
        this.search_results = [];
        for (let tote of this.totes) {
          if (tote.isMe == 1)
            this.search_results.push(tote);
        }
      }
    } else if (choice == 'follows') {
      if (this.search_filters.category.follows) {
        this.search_filters.category.follows = false;
        if (this.search_filters.media.tote == true) {
          this.search_results = JSON.parse(JSON.stringify(this.totes));
        } else {
          this.search_results = JSON.parse(JSON.stringify(this.saved_search_result));
        }
      } else {
        this.search_filters.category.follows = true;
        this.search_filters.category.me = false;
        this.search_filters.category.top = false;
        this.search_results = [];
        for (let tote of this.totes) {
          if (tote.userAnnotote.isMe == 0 && tote.userAnnotote.isTop == 0)
            this.search_results.push(tote);
        }
      }
    } else if (choice == 'top') {
      if (this.search_filters.category.top) {
        this.search_filters.category.top = false;
        if (this.search_filters.media.tote == true) {
          this.search_results = JSON.parse(JSON.stringify(this.totes));
        } else {
          this.search_results = JSON.parse(JSON.stringify(this.saved_search_result));
        }
      } else {
        this.search_filters.category.top = true;
        this.search_filters.category.me = false;
        this.search_filters.category.follows = false;
        this.search_results = [];
        for (let tote of this.totes) {
          if (tote.userAnnotote.isTop == 1)
            this.search_results.push(tote);
        }
      }
    }
    if (this.search_results.length == 0)
      this.no_search = true;
    else
      this.no_search = false;
  }

  follows_tab_from_footer(which) {
    this.follows_popup(null, this.current_active_anotote.userAnnotote);
  }

  annotation_options(highlight) {
    if (this.current_active_anotote.userAnnotote.active_tab == 'me' && this.reorder_highlights == false) {
      this.current_active_anotote.checked = false;
      if (this.search_results.indexOf(this.current_active_anotote) > 2) {
        this.content.scrollTo(0, this.search_results.indexOf(this.current_active_anotote) * 140, 500);
      }
      this.edit_annotation(highlight);
    }
  }

  edit_annotation(highlight) {
    if (this.current_active_highlight != null) {
      if (this.current_active_highlight.id != highlight.id) {
        this.current_active_highlight.edit = false;
        if (highlight.edit) {
          // this.move_fab = false;
          // highlight.edit = false;
        } else {
          // this.move_fab = true;
          highlight.edit = true;
          if (highlight.comment == null)
            highlight.comment = '';
          this.edit_highlight_text = Object.assign(highlight.comment);
          this.edit_actual_highlight = highlight.highlightText;
        }
        this.current_active_highlight = highlight;
      } else {
        if (highlight.edit) {
          // this.move_fab = false;
          // highlight.edit = false;
          // highlight.show_autocomplete = false;
        } else {
          // this.move_fab = true;
          highlight.edit = true;
          if (highlight.comment == null)
            highlight.comment = '';
          this.edit_highlight_text = highlight.comment;
          this.edit_actual_highlight = highlight.highlightText;
        }
      }
    } else {
      if (!highlight.edit) {
        highlight.edit = true;
        if (highlight.comment == null)
          highlight.comment = '';
        this.edit_highlight_text = highlight.comment;
        this.edit_actual_highlight = highlight.highlightText;
      }
      this.current_active_highlight = highlight;
    }
  }

  editField(event) {
    event.stopPropagation();
  }

  ellipsis(event) {
    this.edit_actual_highlight = event;
  }

  tag_user(event) {
    if (event.key == '@' || event.key == '#' || event.key == '$') {
      this.nameInputIndex = event.target.selectionStart;
      var params = {
        tag: event.key,
      }
      let tagsExlusive = this.modalCtrl.create(TagsExclusive, params);
      tagsExlusive.onDidDismiss((data) => {
        if (data) {
          this.edit_highlight_text = this.edit_highlight_text.substring(0, this.nameInputIndex - 1) + data.tag + " " + this.edit_highlight_text.substring(this.nameInputIndex + 1, this.edit_highlight_text.length);
        }
      })
      tagsExlusive.present();
    }
  }

  stop_editing(event, highlight) {
    event.stopPropagation();
    highlight.edit = false;
    highlight.show_autocomplete = false;
    // this.content.resize();
  }

  delete_annotation(annotation) {
    this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to delete this annotation?", () => {
      var toast = this.utilityMethods.doLoadingToast('Deleting')
      this.searchService.get_anotote_content(this.current_active_anotote.userAnnotote.meFilePath)
        .subscribe((response_content) => {
          this.text = response_content.text();
          setTimeout(() => {
            var highlight_quote: any = document.getElementById(annotation.identifier);
            highlight_quote.replaceWith(highlight_quote.innerText);
            var params = {
              user_annotate_id: this.current_active_anotote.userAnnotote.meToteFollowTop.id,
              identifier: annotation.identifier,
              file_text: document.getElementById('temp_text_editor').innerHTML,
              delete: 1
            }
            this.anototeService.delete_annotation(params).subscribe((result) => {
              toast.dismiss();
              this.current_active_anotote.userAnnotote.highlights.splice(this.current_active_anotote.userAnnotote.highlights.indexOf(annotation), 1);
              this.current_active_anotote.userAnnotote.my_highlights.splice(this.current_active_anotote.userAnnotote.my_highlights.indexOf(annotation), 1);
              this.current_active_highlight = null;
              this.stream.top_first_load = false;
              this.stream.me_first_load = false;
              this.stream.follow_first_load = false;
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

  save_edited_annotation(highlight) {
    if ((this.edit_highlight_text != highlight.comment && this.edit_highlight_text != '') || (this.edit_actual_highlight != highlight.highlightText && this.edit_actual_highlight != '')) {
      var hashTags = this.searchService.searchTags('#', this.edit_highlight_text);
      var cashTags = this.searchService.searchTags('$', this.edit_highlight_text);
      var urls = this.searchService.uptags(this.edit_highlight_text);
      var mentions = this.searchService.userTags(this.edit_highlight_text);
      var tags = [];
      if (hashTags.length > 0) {
        for (var i = 0; i < hashTags.length; i++) {
          var tag = {
            text: hashTags[i],
            tag_id: 3,
          }
          tags.push(tag);
        }
      }
      if (cashTags.length > 0) {
        for (var i = 0; i < cashTags.length; i++) {
          var tag = {
            text: cashTags[i],
            tag_id: 4,
          }
          tags.push(tag);
        }
      }
      if (urls.length > 0) {
        for (var i = 0; i < urls.length; i++) {
          var tag = {
            text: urls[i],
            tag_id: 1,
          }
          tags.push(tag);
        }
      }
      if (mentions.length > 0) {
        for (var i = 0; i < mentions.length; i++) {
          var tag = {
            text: mentions[i],
            tag_id: 2,
          }
          tags.push(tag);
        }
      }
      var toast = this.utilityMethods.doLoadingToast("Saving");
      this.searchService.get_anotote_content(this.current_active_anotote.userAnnotote.meFilePath)
        .subscribe((response_content) => {
          this.text = response_content.text();
          setTimeout(() => {
            var highlight_quote = document.getElementById(highlight.identifier);
            highlight_quote.className = "highlight_comment"
            highlight_quote.setAttribute("data-comment", this.edit_highlight_text);

            var params = {
              highlight_text: this.edit_actual_highlight,
              updated_at: this.utilityMethods.get_php_wala_time(),
              file_text: document.getElementById('temp_text_editor').innerHTML,
              comment: this.edit_highlight_text,
              identifier: highlight.identifier,
              user_tote_id: this.current_active_anotote.userAnnotote.meToteFollowTop.id
            }
            this.anototeService.update_annotation(params).subscribe((result) => {
              toast.dismiss();
              highlight.highlightText = this.edit_actual_highlight;
              highlight.comment = result.data.highlight.comment;
              highlight.edit = false;
              highlight.show_autocomplete = false;
              this.current_active_highlight = null;
              this.text = '';
              this.stream.top_first_load = false;
              this.stream.follow_first_load = false;
              // this.edit_actual_highlight = '';
              if (tags.length > 0) {
                var params = {
                  tags: tags,
                  annotation_id: highlight.id,
                  user_annotote_id: this.current_active_anotote.userAnnotote.meToteFollowTop.id,
                  created_at: this.utilityMethods.get_php_wala_time(),
                }
                // this.showLoading('Saving Tags');
                this.searchService.add_tag_to_anotation_all(params).subscribe((result) => {
                  // this.hideLoading();
                  highlight.tags = result.data.annotation_tag;
                }, (error) => {
                  // this.hideLoading();
                  if (error.code == -1) {
                    this.utilityMethods.internet_connection_error();
                  } else {
                    this.utilityMethods.doToast("Couldn't add tag to annotation.");
                  }
                })
              }
            }, (error) => {
              if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
              } else {
                this.utilityMethods.doToast("Couldn't update annotation.");
              }
            })
          }, 500)
        }, (error) => {
          toast.dismiss();
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          } else {
            this.utilityMethods.doToast("Couldn't save annotation.");
          }
        });
    }
  }

  editTitle(anotote) {
    if (this.search_results.indexOf(anotote) > 2) {
      this.content.scrollTo(0, this.search_results.indexOf(anotote) * 65, 500);
    }
    if (anotote.is_tote && anotote.userAnnotote.active_tab == 'me') {
      if (this.current_active_highlight) {
        this.current_active_highlight.edit = false;
        this.current_active_highlight.show_autocomplete = false;
      }
      if (this.current_active_anotote != null) {
        if (this.current_active_anotote.id != anotote.id) {
          this.current_active_anotote.checked = false;
          this.current_active_anotote.active = false;
          if (!anotote.checked) {
            this.title_temp = anotote.userAnnotote.meToteFollowTop.annototeTitle;
            anotote.checked = true;
            anotote.active = false;
          }
          this.current_active_anotote = anotote;
        } else {
          if (!this.current_active_anotote.checked) {
            this.title_temp = anotote.userAnnotote.meToteFollowTop.annototeTitle;
            this.current_active_anotote.checked = true;
            this.current_active_anotote.active = false;
          }
        }
      } else {
        if (!anotote.checked) {
          this.title_temp = anotote.userAnnotote.meToteFollowTop.annototeTitle;
          anotote.checked = true;
        }
        this.current_active_anotote = anotote;
      }
    } else if (anotote.isChat && this.am_i_participant(anotote)) {
      if (this.current_active_anotote != null) {
        if (this.current_active_anotote.id != anotote.id) {
          this.current_active_anotote.checked = false;
          this.current_active_anotote.active = false;
          if (anotote.checked) {
            // this.title_temp = '';
            // this.move_fab = false;
            // anotote.checked = false;  // used variable of bulk action as bulk action is eliminated
          } else {
            this.title_temp = anotote.chatGroup.messagesUser[0].subject;
            // this.move_fab = true;
            anotote.checked = true;
            anotote.active = false;
          }
          this.current_active_anotote = anotote;
        } else {
          if (this.current_active_anotote.checked) {
            //Reverted bulk action pressing to close the editing mode 
            // this.move_fab = false;
            // this.title_temp = '';
            // this.current_active_anotote.checked = false;
            // this.current_active_anotote.active = false;
            // this.current_active_anotote = null;
          } else {
            // this.move_fab = true;
            this.title_temp = anotote.chatGroup.messagesUser[0].subject;
            this.current_active_anotote.checked = true;
            this.current_active_anotote.active = false;
          }
        }
      } else {
        if (anotote.checked) {
          // this.title_temp = '';
          // this.move_fab = false;
          // anotote.checked = false;  // used variable of bulk action as bulk action is eliminated
        } else {
          this.title_temp = anotote.chatGroup.messagesUser[0].subject;
          // this.move_fab = true;
          anotote.checked = true;
        }
        this.current_active_anotote = anotote;
      }
    }
  }

  cancelTitleEdit(event, anotote) {
    event.stopPropagation();
    this.title_temp = '';
    anotote.checked = false;
    this.current_active_anotote = null;
    this.content.resize();
  }

  saveTitle(anotote) {
    if (anotote.chatGroup == null) {
      var toast = this.utilityMethods.doLoadingToast("Saving title");
      var params: any = {
        annotote_id: anotote.userAnnotote.meToteFollowTop.id,
        annotote_title: this.title_temp,
        updated_at: this.utilityMethods.get_php_wala_time()
      }
      this.anototeService.saveTitle(params).subscribe((success) => {
        toast.dismiss();
        anotote.userAnnotote.meToteFollowTop.annototeTitle = success.data.annotote.annototeTitle;
        this.stream.follow_first_load = false;
        this.stream.top_first_load = false;
        this.stream.me_first_load = true;
        anotote.checked = false;
        this.current_active_anotote = null;
      }, (error) => {
        toast.dismiss();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        } else
          this.utilityMethods.doToast("Couldn't update title");
      })
    } else if (anotote.chatGroup != null) {
      if (this.title_temp != anotote.chatGroup.messagesUser[0].subject && this.title_temp != '') {
        var toast = this.utilityMethods.doLoadingToast("Saving title");
        var params: any = {
          group_id: anotote.chatGroup.messagesUser[0].groupId,
          subject: this.title_temp,
          updated_at: this.utilityMethods.get_php_wala_time()
        }
        this.chatService.updateTitle(params).subscribe((success) => {
          toast.dismiss();
          anotote.chatGroup.messagesUser[0].subject = this.title_temp;
          anotote.checked = false;
          this.current_active_anotote = null;
          this.stream.me_first_load = false;
          this.stream.follow_first_load = false;
          this.stream.top_first_load = false;
        }, (error) => {
          toast.dismiss();
          anotote.checked = false;
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          }
        });
      }
    }
  }

  am_i_participant(tote) {
    for (let user of tote.chatGroup.groupUsers) {
      if (user.user.id == this.user.id) {
        return true;
      }
    }
    return false;
  }

}

