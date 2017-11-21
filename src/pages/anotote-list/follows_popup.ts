import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
import { User } from "../../models/user";
@Component({
  selector: 'page-follows',
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
    )],
  templateUrl: 'follows_popup.html',
})
export class FollowsPopup {
  public follows: Array<User> = [];
  public show: boolean = true;
  constructor(params: NavParams, public viewCtrl: ViewController) {
    this.follows = params.get('follows');
  }

  choose_this_user(user: User) {
    let data = { 'user': user };
    this.viewCtrl.dismiss(data);
  }

  dismiss() {
    let data = null;
    this.viewCtrl.dismiss(data);
  }

}
