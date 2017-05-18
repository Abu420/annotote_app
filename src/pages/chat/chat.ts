import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class Chat {

  /**
   * Variables && Configs
   */
  public reply_box_on: boolean;


  /**
   * Constructor
   */
  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods) {
    this.reply_box_on = false;
  }

  /**
  * View LifeCycle Events
  */

  ionViewDidLoad() {
  }

  ionViewWillLeave() {
  }

  /**
  * Methods
  */


  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  show_reply_box() {
    this.reply_box_on = true;
  }
}
