import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, NavParams } from 'ionic-angular';

@Component({
  selector: 'anotote_options',
  templateUrl: 'tote_options.html',
})
export class AnototeOptions {

  public share_type: any;
  public share_content: string;

  constructor(params: NavParams, public viewCtrl: ViewController) {
    this.share_type = params.get('share_type');
    this.share_content = params.get('share_content');
  }

  presentTagsModal() {
    this.dismiss('tags');
  }

  dismiss(data) {
    if (data)
      this.viewCtrl.dismiss(data);
    else
      this.viewCtrl.dismiss();
  }

}