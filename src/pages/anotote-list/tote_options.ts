import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, NavParams } from 'ionic-angular';
import { UtilityMethods } from '../../services/utility_methods';
@Component({
  selector: 'anotote_options',
  templateUrl: 'tote_options.html',
})
export class AnototeOptions {

  public share_type: any;
  public share_content: string;

  constructor(public utilityMethods: UtilityMethods, params: NavParams, public viewCtrl: ViewController) {
    this.share_type = params.get('share_type');
    this.share_content = params.get('share_content');
  }

  presentTagsModal() {
    this.dismiss({ tags: true, share: false, which_share: '' });
  }

  share(which) {
    if (which == 'facebook')
      this.utilityMethods.share_via_facebook("Anotote", null, "");
    else if (which == 'email')
      this.utilityMethods.share_via_email("Anotote", "", "");
    else if (which == 'twitter')
      this.utilityMethods.share_via_twitter("Anotote", "", "");
    else
      this.utilityMethods.share_content_native("Anotote", null, null, "");
  }

  dismiss(data) {
    if (data)
      this.viewCtrl.dismiss(data);
    else
      this.viewCtrl.dismiss({ tags: false });
  }

}