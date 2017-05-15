import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AnototeDetail } from '../anotote-detail/anotote-detail';
import { AnototeEditor } from '../anotote-editor/anotote-editor';
import { StatusBar } from '@ionic-native/status-bar';
/**
 * Services
 */
import {UtilityMethods} from '../../services/utility_methods';

@IonicPage()
@Component({
  selector: 'page-anotote-list',
  templateUrl: 'anotote-list.html',
})
export class AnototeList {

  constructor(public navCtrl: NavController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods) {
        // set status bar to green
        this.statusBar.backgroundColorByHexString('#3bde00');
  }

  open_annotote_site() {
        this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AnototeList');
  }

  popView(){
     this.navCtrl.pop();
   }

  go_to_editor(event) {
    this.navCtrl.push(AnototeEditor, {});
  }

  openAnototeDetail(event) {
    this.navCtrl.push(AnototeDetail, {});
  }

}
