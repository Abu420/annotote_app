import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { AnototeList } from '../anotote-list/anotote-list';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
  constructor(public navCtrl: NavController) {

  }
  
  openAnototeList(event) {
        this.navCtrl.push(AnototeList, {});
  }
}
