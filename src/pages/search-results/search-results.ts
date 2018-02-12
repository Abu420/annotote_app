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

  go_to_browser(anotote) {
    if (anotote.userAnnotote.anototeType == 'me' || anotote.userAnnotote.anototeType == 'follows' || anotote.userAnnotote.anototeType == 'top')
      this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'search_result', WHICH_STREAM: anotote.userAnnotote.anototeType, actual_stream: anotote.userAnnotote.anototeType });
    else
      this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'search_result', WHICH_STREAM: 'anon', actual_stream: 'anon' });
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
              if (tote.userAnnotote.follows.length > 0) {
                tote.selected_follower_name = tote.userAnnotote.follows[0].firstName;
              }
              this.search_results.push(tote);
            }
          }
          console.log(this.search_results);
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
    if (search_result.is_tote) {
      this.go_to_browser(search_result);
    } else {
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
}

