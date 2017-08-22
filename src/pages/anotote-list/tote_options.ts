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
  public anotote: any;

  constructor(public utilityMethods: UtilityMethods, params: NavParams, public viewCtrl: ViewController) {
    this.share_type = params.get('share_type');
    this.share_content = params.get('share_content');
    this.anotote = params.get('anotote');
  }

  presentTagsModal() {
    this.dismiss({ tags: true, share: false, which_share: '' });
  }

  share(which) {
    if (which == 'facebook')
      this.utilityMethods.share_via_facebook("Anotote", null, this.anotote.userAnnotote.filePath);
    else if (which == 'email')
      this.utilityMethods.share_via_email(this.anotote.userAnnotote.filePath, "Anotote", "");
    else if (which == 'twitter')
      this.utilityMethods.share_via_twitter("Anotote", "", this.anotote.userAnnotote.filePath);
    else
      this.utilityMethods.share_content_native("Anotote", null, null, this.anotote.userAnnotote.filePath);
  }

  dismiss(data) {
    if (data)
      this.viewCtrl.dismiss(data);
    else
      this.viewCtrl.dismiss({ tags: false });
  }

}