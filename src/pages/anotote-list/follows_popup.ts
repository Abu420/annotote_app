import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController , NavParams } from 'ionic-angular';
import {User} from "../../models/user";
@Component({
  selector: 'follows_popup',
  templateUrl: 'follows_popup.html',
})
export class FollowsPopup {
  public follows:Array<User> = [];
 constructor(params: NavParams,public viewCtrl: ViewController) {
   this.follows = params.get('follows');
 }

 choose_this_user(user:User) {
   let data = { 'user': user };
   this.viewCtrl.dismiss(data);
 }

  dismiss() {
   let data = null;
   this.viewCtrl.dismiss(data);
 }

}
