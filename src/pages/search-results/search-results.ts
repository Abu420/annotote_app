import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';

@IonicPage()
@Component({
  selector: 'search-results',
  templateUrl: 'search-results.html',
})
export class SearchResults {

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods) {
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AnototeDetail');
  }
}
