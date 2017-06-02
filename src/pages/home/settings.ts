import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
@Component({
  selector: 'home_settings',
  templateUrl: 'settings.html',
})
export class Settings {

  constructor(params: NavParams, public viewCtrl: ViewController) {
  }

  logout() {
    this.dismiss('logout');
  }

  dismiss(action) {
    if (action)
      this.viewCtrl.dismiss(action);
    else
      this.viewCtrl.dismiss();
  }

}