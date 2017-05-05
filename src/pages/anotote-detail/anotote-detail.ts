import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
import { AnototeOptions } from '../anotote-detail/tote_options';
import { ViewOptions } from '../anotote-detail/view_options';

/**
 * Generated class for the AnototeDetail page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-anotote-detail',
  templateUrl: 'anotote-detail.html',
})
export class AnototeDetail {

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AnototeDetail');
  }



  popView(){
     this.navCtrl.pop();
  }

  presentAnototeOptionsModal() {
     let anototeOptionsModal = this.modalCtrl.create(AnototeOptions, null);
     anototeOptionsModal.present();
  }

  presentViewOptionsModal() {
     let viewsOptionsModal = this.modalCtrl.create(ViewOptions, null);
     viewsOptionsModal.present();
  }

}
