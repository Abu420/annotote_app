import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, Events } from 'ionic-angular';
import { Chat } from '../chat/chat';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { AuthenticationService } from '../../services/auth.service';

@Component({
  selector: 'follow_profile',
  templateUrl: 'follows_profile.html',
})
export class Profile {

  public profileData: any;
  public from_page: string;
  public is_it_me: boolean;

  constructor(params: NavParams, public navCtrl: NavController, public authService: AuthenticationService, public events: Events, public viewCtrl: ViewController, public utilityMethods: UtilityMethods, public searchService: SearchService) {
    this.profileData = params.get('data');
    this.from_page = params.get('from_page');
    var current_user = this.authService.getUser();
    if (this.profileData.user.id == current_user.id)
      this.is_it_me = true;
    else
      this.is_it_me = false;
  }

  go_to_thread() {
    this.navCtrl.push(Chat, { secondUser: this.profileData.user });
  }

  followUser() {
    let self = this;
    var current_time = (new Date()).getTime() / 1000;
    this.utilityMethods.show_loader('Please wait...');
    this.searchService.follow_user({
      created_at: current_time,
      follows_id: this.profileData.user.id
    }).subscribe((response) => {
      this.utilityMethods.hide_loader();
      this.profileData.user.isFollowed = 1;
      if (this.from_page == 'search_results')
        this.events.publish('user:followed', this.profileData.user.id);
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    });
  }

  unFollowUser(event, person) {
    let self = this;
    var current_time = (new Date()).getTime() / 1000;
    this.utilityMethods.show_loader('Please wait...');
    this.searchService.un_follow_user({
      created_at: current_time,
      follows_id: this.profileData.user.id
    }).subscribe((response) => {
      this.utilityMethods.hide_loader();
      this.profileData.user.isFollowed = 0;
      if (this.from_page == 'search_results')
        this.events.publish('user:unFollowed', this.profileData.user.id);
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}