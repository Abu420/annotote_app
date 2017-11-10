import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, NavParams } from 'ionic-angular';
import { Profile } from '../follows/follows_profile';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { AuthenticationService } from '../../services/auth.service';
import { Constants } from '../../services/constants.service'
import { Clipboard } from '@ionic-native/clipboard';



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
  templateUrl: 'me_options.html',

})
export class MeOptions {
  public current_user: any;
  public show: boolean = true;
  public topOrnot: boolean = true;
  constructor(public clip: Clipboard, params: NavParams, public constants: Constants, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public searchService: SearchService, public viewCtrl: ViewController, public authService: AuthenticationService) {
    this.current_user = this.authService.getUser();
    if (params.get('from'))
      this.topOrnot = false;
  }

  share_me_tote(type) {
    var me_anotote_link = this.constants.API_BASEURL + '/' + this.current_user.firstName.replace(" ", "") + '/' + this.current_user.id;
    if (type == 'link')
      this.utilityMethods.share_content_native("Me Tote", "Me tote", null, me_anotote_link);
    else if (type == 'facebook')
      this.utilityMethods.share_via_facebook("Me Tote", null, me_anotote_link);
    else if (type == 'twitter')
      this.utilityMethods.share_via_twitter("Me Tote", null, me_anotote_link);
    else if (type == 'email')
      this.utilityMethods.share_via_email("Me Tote", null, me_anotote_link);
    else if (type == 'copy') {
      this.clip.copy(me_anotote_link).then((success) => {
        this.utilityMethods.doToast("Link copied to clipboard");
      }, (error) => {
        this.utilityMethods.doToast("Couldn't copy");
      });
    }

  }

  open_settings_menu() {
    this.dismiss('settings');
  }

  open_chat() {
    this.dismiss('chat');
  }

  dismiss(action) {
    this.show = false;
    setTimeout(() => {
      if (action)
        this.viewCtrl.dismiss(action);
      else
        this.viewCtrl.dismiss();
    }, 300)
  }

}