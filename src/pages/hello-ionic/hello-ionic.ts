import { Component } from '@angular/core';

import { Login } from '../login/login';
import { Signup } from '../signup/signup';
import { NavController, NavParams } from 'ionic-angular';
import { AnototeList } from '../anotote-list/anotote-list';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
  constructor(public navCtrl: NavController) {

  }

  login() {
        this.navCtrl.push(Login, {});
  }

  signup() {
        this.navCtrl.push(Signup, {});
  }
  
  openAnototeList(event) {
        this.navCtrl.push(AnototeList, {});
  }
}
