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
import { TagsPopUp } from "../anotote-list/tags";
import { ChatToteOptions } from "../anotote-list/chat_tote";
import { Chat } from "../chat/chat";
import { FollowsPopup } from "../anotote-list/follows_popup";
import { AnototeService } from "../../services/anotote.service";

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
  public move_fab = false;
  public current_active_highlight;
  public follow_visited = false;

  constructor(public stream: Streams,
    public authService: AuthenticationService,
    public searchService: SearchService,
    public anototeService: AnototeService,
    private params: NavParams,
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public utilityMethods: UtilityMethods,
    public statusBar: StatusBar) {
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
        tote.userAnnotote.spinner_for_active = false;
        var active_tab = 'anon';
        if (tote.userAnnotote.isMe == 1) {
          tote.userAnnotote.userAnnotote.my_highlights = Object.assign(tote.userAnnotote.highlights);
          tote.userAnnotote.userAnnotote.meFilePath = Object.assign(tote.userAnnotote.userAnnotote.filePath);
          active_tab = 'me'
        } else if (tote.userAnnotote.isMe == 0 && tote.userAnnotote.isTop == 0) {
          active_tab = 'follows';
        } else if (tote.userAnnotote.isTop == 1) {
          active_tab = 'top';
          tote.userAnnotote.top_highlights = Object.assign(tote.userAnnotote.highlights);
        }
        tote.userAnnotote.active_tab = active_tab;
        if (tote.userAnnotote.follows.length > 0) {
          tote.userAnnotote.selected_follower_name = tote.userAnnotote.follows[0].firstName;
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
              tote.userAnnotote.spinner_for_active = false;
              var active_tab = 'anon';
              if (tote.userAnnotote.isMe == 1) {
                tote.userAnnotote.userAnnotote.my_highlights = Object.assign(tote.userAnnotote.highlights);
                tote.userAnnotote.userAnnotote.meFilePath = Object.assign(tote.userAnnotote.userAnnotote.filePath);
                active_tab = 'me'
              } else if (tote.userAnnotote.isMe == 0 && tote.userAnnotote.isTop == 0) {
                active_tab = 'follows';
              } else if (tote.userAnnotote.isTop == 1) {
                active_tab = 'top';
                tote.userAnnotote.top_highlights = Object.assign(tote.userAnnotote.highlights);
              }
              tote.userAnnotote.active_tab = active_tab;
              if (tote.userAnnotote.follows.length > 0) {
                tote.userAnnotote.selected_follower_name = tote.userAnnotote.follows[0].firstName;
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
      whichStream: 'search',
      active_tab: anotote.userAnnotote.active_tab
    }

    let anototeOptionsModal = this.modalCtrl.create(AnototeOptions, params);
    anototeOptionsModal.onDidDismiss(data => {
      if (data.tags) {
        var params = {
          user_tote_id: anotote.userAnnotote.userAnnotote.id,
          tags: anotote.userAnnotote.userAnnotote.tags,
          whichStream: anotote.userAnnotote.active_tab,
          annotote: true
        }
        let tagsModal = this.modalCtrl.create(TagsPopUp, params);
        tagsModal.present();

      } else if (data.delete == true) {
        this.current_active_anotote = null;
        this.stream.top_first_load = false;
        this.stream.follow_first_load = false;
        this.stream.me_first_load = false;
        this.search_results.splice(this.search_results.indexOf(anotote), 1);
      } else if (data.chat) {
        var chatParams = {
          anotote: anotote.userAnnotote,
          stream: 'anon',
          findChatter: true
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
    event.stopPropagation();
    if (anotote.follows.length == 1) {
      anotote.selected_follower_name = anotote.follows[0].firstName;
      anotote.active_tab = 'follows';
      this.follow_visited = true;
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
            this.loadFollower(anotote, data.user);
          }
        });
        anototeOptionsModal.present();
      } else {
        anotote.selected_follower_name = anotote.follows[0].firstName;
        anotote.active_tab = 'follows';
        this.follow_visited = true;
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
    if (anotote.userAnnotote.my_highlights) {
      anotote.highlights = Object.assign(anotote.userAnnotote.my_highlights);
      anotote.meFilePath = anotote.userAnnotote.filePath;
      anotote.active_tab = 'me';
    } else {
      // if (this.current_color == 'top' && anotote.anototeDetail.meToteFollowTop.id == anotote.userAnnotote.id) {
      //   anotote.my_highlights = anotote.top_highlights;
      //   anotote.highlights = Object.assign(anotote.my_highlights);
      //   anotote.active_tab = 'me'
      //   anotote.meFilePath = anotote.anototeDetail.userAnnotote.filePath;
      //   this.move_fab = false;
      // } 
      // else if (anotote.my_highlights == undefined) {
      //   this.me_spinner = true;
      //   var params = {
      //     user_id: this.user.id,
      //     anotote_id: this.current_color == 'follows' ? anotote.userAnnotote.anototeDetail.meToteFollowTop.id : anotote.anototeDetail.meToteFollowTop.id,
      //     time: this.utilityMethods.get_php_wala_time()
      //   }
      //   this.anototeService.fetchToteDetails(params).subscribe((result) => {
      //     this.me_spinner = false;
      //     this.move_fab = false;
      //     if (result.status == 1) {
      //       anotote.active_tab = 'me'
      //       anotote.highlights = Object.assign(result.data.annotote.highlights);
      //       anotote.my_highlights = result.data.annotote.highlights;
      //       anotote.meFilePath = result.data.annotote.userAnnotote.filePath;
      //     } else {
      //       this.toastInFooter("Couldn't fetch annotations");
      //       anotote.active = false;
      //     }
      //   }, (error) => {
      //     this.me_spinner = false;
      //     if (error.code == -1) {
      //       this.utilityMethods.internet_connection_error();
      //     }
      //   });
      // } else {
      //   this.move_fab = false;
      //   anotote.active_tab = 'me';
      //   anotote.highlights = Object.assign(anotote.my_highlights);
      // }
    }
  }

  show_top_tab(anotote) {
    if (anotote.top_highlights == undefined) {
      // if (anotote.userAnnotote.id != anotote.topUserToteId) {
      //   this.top_spinner = true;
      //   var params = {
      //     user_id: this.user.id,
      //     anotote_id: anotote.topUserToteId,
      //     time: this.utilityMethods.get_php_wala_time()
      //   }
      //   this.anototeService.fetchToteDetails(params).subscribe((result) => {
      //     this.top_spinner = false;
      //     this.move_fab = true;
      //     anotote.active_tab = 'top'
      //     anotote.topFilePath = result.data.annotote.userAnnotote.filePath;
      //     anotote.top_tags = result.data.annotote.userAnnotote.tags;
      //     anotote.topVote = {
      //       currentUserVote: result.data.annotote.userAnnotote.currentUserVote,
      //       rating: result.data.annotote.userAnnotote.rating,
      //       isCurrentUserVote: result.data.annotote.userAnnotote.isCurrentUserVote
      //     }
      //     if (result.status == 1) {
      //       anotote.highlights = Object.assign(result.data.annotote.highlights);
      //       anotote.top_highlights = result.data.annotote.highlights;
      //     } else {
      //       this.toastInFooter("Could not fetch top data");
      //     }
      //   }, (error) => {
      //     this.utilityMethods.hide_loader();
      //     if (error.code == -1) {
      //       this.utilityMethods.internet_connection_error();
      //     }
      //   })
      // } else {
      //   this.move_fab = true;
      //   anotote.top_highlights = anotote.userAnnotote.annototeHeighlights;
      //   anotote.active_tab = 'top';
      //   anotote.topFilePath = anotote.userAnnotote.filePath;
      //   anotote.top_tags = anotote.userAnnotote.anototeDetail.userAnnotote.tags
      //   anotote.topVote = {
      //     currentUserVote: anotote.userAnnotote.anototeDetail.userAnnotote.currentUserVote,
      //     rating: anotote.userAnnotote.anototeDetail.userAnnotote.rating,
      //     isCurrentUserVote: anotote.userAnnotote.anototeDetail.userAnnotote.isCurrentUserVote
      //   }
      // }
    } else {
      this.move_fab = true;
      anotote.active_tab = 'top'
      anotote.highlights = Object.assign(anotote.top_highlights);
    }
  }
}

