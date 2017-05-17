import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';
import { AnototeDetail } from '../anotote-detail/anotote-detail';
import { AnototeEditor } from '../anotote-editor/anotote-editor';
import { Anotote } from '../../models/anotote';
import { StatusBar } from '@ionic-native/status-bar';
import { AnototeOptions } from '../anotote-detail/tote_options';
import { ViewOptions } from '../anotote-detail/view_options';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';

@IonicPage()
@Component({
  selector: 'page-anotote-list',
  templateUrl: 'anotote-list.html',
})
export class AnototeList {

  /**
   * Variables && Configs
   */
  public anototes: Anotote[];
  public edit_mode: boolean; // True for edit list mode while false for simple list
  public current_active_anotote: Anotote;

  /**
   * Constructor
   */
  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public navParams: NavParams, public statusBar: StatusBar, public utilityMethods: UtilityMethods) {
  }

  /**
   * View LifeCycle Events
   */
  ionViewDidLoad() {
    // set status bar to green
    this.statusBar.backgroundColorByHexString('#3bde00');
    this.anototes = [];
    /**
     * Set default mode to list not the edit one
     */
    this.edit_mode = false;

    this.anototes.push(new Anotote(1, "Chantel Bardaro Message", "Message", "", "12:45", "message", false));
    this.anototes.push(new Anotote(2, "Times website hacked", "The New York Times", "", "10:24", "anotote_txt", false));
    this.anototes.push(new Anotote(3, "The future of business: Open", "The Buttonwood Tree", "", "08/24", "anotote_video", false));
    this.anototes.push(new Anotote(4, "Open source economics", "TED Talks", "", "10/20", "anotote_image", false));
    this.anototes.push(new Anotote(5, "Recipe: Cranberry & herb", "Food Network", "", "10:24", "anotote_txt", false));
    this.anototes.push(new Anotote(6, "Alcoa: 2015ql earnings", "Bloomberg", "", "08:10", "anotote_audio", false));
    this.anototes.push(new Anotote(7, "Homeland (S4:E6)", "Showtime", "", "08:10", "anotote_video", false));
  }

  ionViewWillLeave() {
    console.log("Looks like I'm about to leave :(");
  }

  /**
   * Methods
   */

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  bulkAction(anotote) {
    this.edit_mode = true;
    anotote.checked = !anotote.checked;
  }

  close_bulk_actions() {
    this.edit_mode = false;
  }

  popView() {
    this.navCtrl.pop();
  }

  go_to_editor(event) {
    this.navCtrl.push(AnototeEditor, {});
  }

  openAnototeDetail(anotote) {
    if (this.current_active_anotote) {
      this.current_active_anotote.active = false;
      if (this.current_active_anotote.id == anotote.id) {
        this.current_active_anotote = null;
        return;
      }
    }
    this.current_active_anotote = anotote
    this.current_active_anotote.active = !this.current_active_anotote.active;
    // this.navCtrl.push(AnototeDetail, {});
  }

  presentAnototeOptionsModal() {
    let anototeOptionsModal = this.modalCtrl.create(AnototeOptions, null, { showBackdrop: true, enableBackdropDismiss: true });
    anototeOptionsModal.present();
  }

  presentViewOptionsModal() {
    let viewsOptionsModal = this.modalCtrl.create(ViewOptions, null);
    viewsOptionsModal.present();
  }

}