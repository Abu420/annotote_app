import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AnototeDetail } from '../anotote-detail/anotote-detail';
/**
 * Generated class for the AnototeList page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-anotote-list',
  templateUrl: 'anotote-list.html',
})
export class AnototeList {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AnototeList');
  }

  popView(){
     this.navCtrl.pop();
   }


  openAnototeDetail(event) {
    this.navCtrl.push(AnototeDetail, {});
  }

}
