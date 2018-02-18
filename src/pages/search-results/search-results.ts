import { Component, ViewChild } from '@angular/core';
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

@IonicPage()
@Component({
  selector: 'search-results',
  templateUrl: 'search-results.html',
})
export class SearchResults {
  @ViewChild(Content) content: Content;
  private search_term: string;
  private _loading: boolean = false;
  private search_results: any = [];
  private user_id: number;
  private show_search_field: boolean = false;
  private hide_header_contents: boolean = false;
  private no_search: boolean = false;
  public current_active_anotote;
  public move_fab;
  public current_active_highlight;

  constructor(public stream: Streams, public authService: AuthenticationService, public searchService: SearchService, private params: NavParams, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public statusBar: StatusBar) {
    this.search_term = params.get('search_term');
    var results = params.get('results');
    for (let tote of results) {
      if (tote.annotote) {
        tote.is_tote = true;
        tote.active = false;
        tote.userAnnotote.userAnnotote.follows = tote.userAnnotote.follows;
        tote.userAnnotote.userAnnotote.highlights = tote.userAnnotote.highlights;
        tote.userAnnotote.userAnnotote.isMe = tote.userAnnotote.isMe;
        tote.userAnnotote.userAnnotote.isTop = tote.userAnnotote.isTop;
        var active_tab = 'anon';
        if (tote.userAnnotote.isMe == 1) {
          active_tab = 'me'
        } else if (tote.userAnnotote.isMe == 0 && tote.userAnnotote.isTop == 0) {
          active_tab = 'follows';
        } else if (tote.userAnnotote.isTop == 1) {
          active_tab = 'top';
        }
        tote.userAnnotote.active_tab = active_tab;
        if (tote.userAnnotote.follows.length > 0) {
          tote.selected_follower_name = tote.userAnnotote.follows[0].firstName;
        }
        this.search_results.push(tote);
      } else {
        tote.is_tote = false;
        tote.follow_loading = false;
        this.search_results.push(tote);
      }
    }
    this.user_id = this.authService.getUser().id;
    this.show_search();
    if (this.search_results.length == 0)
      this.no_search = true;
  }

  clear() {
    this.search_term = '';
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() {
    // this.load_search_results();
  }

  ionViewDidEnter() {
    this.statusBar.backgroundColorByHexString('#323232');
  }

  show_search() {
    if (this.show_search_field) {
      this.show_search_field = false;
      let timeoutId = setTimeout(() => {
        this.hide_header_contents = false;
      }, 1000);
    } else {
      this.show_search_field = true;
      this.hide_header_contents = true;


    }
  }

  go_to_browser(anotote, highlight) {
    // if (anotote.userAnnotote.anototeType == 'me' || anotote.userAnnotote.anototeType == 'follows' || anotote.userAnnotote.anototeType == 'top')
    //   this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'search_result', WHICH_STREAM: anotote.userAnnotote.anototeType, actual_stream: anotote.userAnnotote.anototeType });
    // else
    //   this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'search_result', WHICH_STREAM: 'anon', actual_stream: 'anon' });

    this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote.userAnnotote, FROM: 'search_result', WHICH_STREAM: 'anon', HIGHLIGHT_RECEIVED: highlight, actual_stream: anotote.userAnnotote.active_tab });
  }

  load_search_results() {
    this.search_results = [];
    this.no_search = false;
    this._loading = true;
    var params = {
      term: this.search_term,
      type: '',
      annotote_type: false,
      time: 0
    }
    this.searchService.general_search(params)
      .subscribe((response) => {
        this._loading = false;
        if (response.status == 1) {
          for (let tote of response.data.annotote) {
            if (tote.annotote) {
              tote.is_tote = true;
              tote.active = false;
              tote.userAnnotote.userAnnotote.follows = tote.userAnnotote.follows;
              tote.userAnnotote.userAnnotote.highlights = tote.userAnnotote.highlights;
              tote.userAnnotote.userAnnotote.isMe = tote.userAnnotote.isMe;
              tote.userAnnotote.userAnnotote.isTop = tote.userAnnotote.isTop;
              var active_tab = 'anon';
              if (tote.userAnnotote.isMe == 1) {
                active_tab = 'me'
              } else if (tote.userAnnotote.isMe == 0 && tote.userAnnotote.isTop == 0) {
                active_tab = 'follows';
              } else if (tote.userAnnotote.isTop == 1) {
                active_tab = 'top';
              }
              tote.userAnnotote.active_tab = active_tab;
              if (tote.userAnnotote.follows.length > 0) {
                tote.selected_follower_name = tote.userAnnotote.follows[0].firstName;
              }

              this.search_results.push(tote);
            }
          }
          for (let user of response.data.user) {
            user.is_tote = false;
            user.follow_loading = false;
            this.search_results.push(user);
          }
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

    this.utilityMethods.show_loader('');
    this.searchService.get_user_profile_info(search_result.id)
      .subscribe((response) => {
        this.utilityMethods.hide_loader();
        if (response.data.user != null)
          this.presentProfileModal(response);
        else
          this.utilityMethods.doToast("Couldn't load user.");
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });

  }

  presentProfileModal(response) {
    let profile = this.modalCtrl.create(Profile, {
      data: response.data,
      from_page: 'search_results'
    });
    profile.onDidDismiss(data => {
    });
    profile.present();
  }

  openAnototeDetail(anotote) {

    //-----
    if (this.current_active_anotote) {
      this.current_active_anotote.active = false;
      this.current_active_anotote.checked = false;
      if (this.current_active_anotote.chatGroupId && anotote.chatGroupId == null)
        this.move_fab = false;
      else if (this.current_active_anotote.chatGroupId && this.current_active_anotote.chatGroupId == anotote.chatGroupId)
        this.move_fab = false;
      else if (anotote.userAnnotote && this.current_active_anotote.userAnnotote.id == anotote.userAnnotote.id)
        this.move_fab = false;
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
  }

  presentAnototeOptionsModal(event, anotote) {
    event.stopPropagation();
    var params = {
      anotote: anotote.userAnnotote,
      whichStream: 'anon',
      active_tab: anotote.userAnnotote.active_tab
    }

    let anototeOptionsModal = this.modalCtrl.create(AnototeOptions, params);
    anototeOptionsModal.onDidDismiss(data => {
      // if (data.tags) {
      //   if (anotote.chatGroup == null) {
      //     if (this.current_color != 'top') {
      //       if (this.current_color == 'me' && (anotote.active_tab == 'me' || anotote.active_tab == undefined)) {
      //         var params = {
      //           user_tote_id: anotote.userAnnotote.id,
      //           tags: anotote.userAnnotote.anototeDetail.userAnnotote.tags,
      //           whichStream: 'me',
      //           annotote: true
      //         }
      //       } else if (this.current_color == 'follows' && anotote.active_tab == 'me') {
      //         var params = {
      //           user_tote_id: anotote.userAnnotote.anototeDetail.meToteFollowTop.id,
      //           tags: anotote.userAnnotote.anototeDetail.meToteFollowTop.tags,
      //           whichStream: 'me',
      //           annotote: true
      //         }
      //       } else if (anotote.active_tab == 'follows' || (this.current_color == 'follows' && anotote.active_tab == undefined)) {
      //         var params = {
      //           user_tote_id: anotote.userAnnotote.id,
      //           tags: anotote.follower_tags,
      //           whichStream: 'follows',
      //           annotote: true
      //         }
      //       } else if (anotote.active_tab == 'top') {
      //         var params = {
      //           user_tote_id: anotote.userAnnotote.id,
      //           tags: anotote.top_tags,
      //           whichStream: 'top',
      //           annotote: true
      //         }
      //       }
      //       let tagsModal = this.modalCtrl.create(TagsPopUp, params);
      //       tagsModal.present();
      //     } else if (this.current_color == 'top') {
      //       if (anotote.active_tab == 'me') {
      //         var params = {
      //           user_tote_id: anotote.anototeDetail.meToteFollowTop.id,
      //           tags: anotote.anototeDetail.meToteFollowTop.tags,
      //           whichStream: 'me',
      //           annotote: true
      //         }
      //       } else if (anotote.active_tab == 'follows') {
      //         var params = {
      //           user_tote_id: anotote.userAnnotote.id,
      //           tags: anotote.follower_tags,
      //           whichStream: 'follows',
      //           annotote: true
      //         }
      //       } else if (anotote.active_tab == 'top' || anotote.active_tab == undefined) {
      //         var params = {
      //           user_tote_id: anotote.userAnnotote.id,
      //           tags: anotote.anototeDetail.userAnnotote.tags,
      //           whichStream: 'top',
      //           annotote: true
      //         }
      //       }

      //       let tagsModal = this.modalCtrl.create(TagsPopUp, params);
      //       tagsModal.present();
      //     }
      //   } else {
      //     if (message == null) {
      //       var paramsObj = {
      //         chatId: anotote.chatGroup.id,
      //         tags: anotote.chatGroup.chatTags,
      //         whichStream: 'chat',
      //         chatOrTxt: true,
      //         participants: anotote.chatGroup.groupUsers
      //       }
      //     } else {
      //       var paramsObj = {
      //         chatId: message.id,
      //         tags: message.messageTags,
      //         whichStream: 'chat',
      //         chatOrTxt: false,
      //         participants: anotote.chatGroup.groupUsers
      //       }
      //     }
      //     let tagsModal = this.modalCtrl.create(TagsPopUp, paramsObj);
      //     tagsModal.present();
      //   }
      // } else if (data.delete == true) {
      //   if (message == null) {
      //     if (this.current_color == 'me') {
      //       this.current_active_anotote = null;
      //       this.stream.top_first_load = false;
      //       this.stream.follow_first_load = false;
      //       this.anototes.splice(this.anototes.indexOf(anotote), 1);
      //     } else {
      //       anotote.isMe = 0;
      //       if (this.current_color == 'follows') {
      //         this.loadFollower(anotote, anotote.follower[0]);
      //       } else {
      //         this.loadFollower(anotote, anotote.follows[0]);
      //       }
      //     }
      //   } else {
      //     anotote.chatGroup.messagesUser.splice(anotote.chatGroup.messagesUser.indexOf(message), 1);
      //   }
      // } else if (data.chat) {
      //   var chatParams = {
      //     anotote: anotote,
      //     stream: this.current_color,
      //     findChatter: true
      //   }
      //   let chatTote = this.modalCtrl.create(ChatToteOptions, chatParams);
      //   chatTote.onDidDismiss((data) => {
      //     if (data.chat) {
      //       if (data.title)
      //         this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: true, anotote_id: this.current_active_anotote.userAnnotote.annototeId, title: data.title, full_tote: this.current_active_anotote });
      //       else
      //         this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: false, anotote_id: null, title: '' });
      //     }
      //   })
      //   chatTote.present();
      // }
    });
    anototeOptionsModal.present();
  }

  presentViewOptionsModal() {

    var params = {
      anotote: this.current_active_anotote.userAnnotote,
      stream: 'anon'
    }

    let viewsOptionsModal = this.modalCtrl.create(ViewOptions, params);
    viewsOptionsModal.onDidDismiss((preference) => {
      // if (preference.tab_selected == 'me')
      //   this.showMeHighlights(this.current_active_anotote);
      // else if (preference.tab_selected == 'follows' && this.current_color != 'top')
      //   this.open_follows_popup(event, this.current_active_anotote);
      // else if (preference.tab_selected == 'follows' && this.current_color == 'top')
      //   this.top_follows_popup(event, this.current_active_anotote);
      // else if (preference.tab_selected == 'top')
      //   this.show_top_tab(this.current_active_anotote);
    })
    viewsOptionsModal.present();
    // } else {
    //   if (this.followedUserId != 0)
    //     this.toastInFooter("Please follow this user first");
    //   else
    //     this.toastInFooter("Please open this tote from streams");
    // }
  }
}

