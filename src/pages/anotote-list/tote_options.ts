import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, NavParams } from 'ionic-angular';

@Component({
  selector: 'anotote_options',
  templateUrl: 'tote_options.html',
})
export class AnototeOptions {

  constructor(params: NavParams, public viewCtrl: ViewController) {
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