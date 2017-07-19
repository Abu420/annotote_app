import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';

@IonicPage()
@Component({
  selector: 'search-results',
  templateUrl: 'search-results.html',
})
export class SearchResults {
  private search_term: string;
  private loading: boolean;

  constructor(public search_service: SearchService, private params: NavParams, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods) {
    this.search_term = params.get('search_term');
    this.loading = false;
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() {
    this.load_search_results();
  }

  load_search_results() {
    console.log(this.search_term);
    this.search_service.get_search_results(this.search_term)
      .subscribe((res) => {
        this.loading = true;
        console.log(res);
      }, (err) => {
        this.loading = true;
        console.log(err);
      });
  }
}
