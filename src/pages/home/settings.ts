import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, NavParams } from 'ionic-angular';
import { Profile } from '../follows/follows_profile';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { AuthenticationService } from '../../services/auth.service';
import { StatusBar } from "@ionic-native/status-bar";

@Component({
  selector: 'home_settings',
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
  templateUrl: 'settings.html',
})
export class Settings {
  public current_user: any;
  public show: boolean = true;

  constructor(public statusbar: StatusBar, params: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public searchService: SearchService, public viewCtrl: ViewController, public authService: AuthenticationService) {
    this.current_user = this.authService.getUser();
    statusbar.hide();
  }

  logout() {
    this.statusbar.show();
    this.dismiss('logout');
  }

  back() {
    this.statusbar.show();
    this.dismiss('back');
  }

  showProfile() {
    this.viewCtrl.dismiss();
    let profile = this.modalCtrl.create(Profile, {
      data: this.current_user.id
    });
    profile.onDidDismiss(data => {
    });
    profile.present();

  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  dismiss(action) {
    this.statusbar.show();
    this.show = false;
    setTimeout(() => {
      if (action)
        this.viewCtrl.dismiss(action);
      else
        this.viewCtrl.dismiss();
    }, 300)
  }

}