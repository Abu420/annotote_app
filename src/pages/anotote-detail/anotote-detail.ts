import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
import { AnototeOptions } from '../anotote-detail/tote_options';
import { ViewOptions } from '../anotote-detail/view_options';
/**
 * Services
 */
import {UtilityMethods} from '../../services/utility_methods';

@IonicPage()
@Component({
  selector: 'page-anotote-detail',
  templateUrl: 'anotote-detail.html',
})
export class AnototeDetail {

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods) {
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AnototeDetail');
  }



  popView() {
    this.navCtrl.pop();
  }

  presentAnototeOptionsModal() {
    let anototeOptionsModal = this.modalCtrl.create(AnototeOptions, null, {showBackdrop: true, enableBackdropDismiss: true});
    anototeOptionsModal.present();
  }

  presentViewOptionsModal() {
    let viewsOptionsModal = this.modalCtrl.create(ViewOptions, null);
    viewsOptionsModal.present();
  }

}
