import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, ModalController, Events } from 'ionic-angular';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
@Component({
    selector: 'anotote_content_options',
    templateUrl: 'content_options.html',
})
export class AnototeContentOptions {

    constructor(public params: NavParams, public navCtrl: NavController, public events: Events, public utilityMethods: UtilityMethods, public viewCtrl: ViewController, public modalCtrl: ModalController) {
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}