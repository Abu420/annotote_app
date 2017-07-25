import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
import { AnototeEditor } from '../anotote-editor/anotote-editor';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { AuthenticationService } from '../../services/auth.service';

@IonicPage()
@Component({
  selector: 'search-results',
  templateUrl: 'search-results.html',
})
export class SearchResults {
  private search_term: string;
  private _loading: boolean;
  private search_results: any;
  private user_id: number;

  constructor(public authService: AuthenticationService, public search_service: SearchService, private params: NavParams, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods) {
    this.search_term = params.get('search_term');
    this._loading = false;
    this.search_results = [];
    this.user_id = this.authService.getUser().id;
  }

  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  ionViewDidLoad() {
    this.load_search_results();
  }

  go_to_browser(result) {
    var anotote = {
      userAnnotote: {
        id: result.userAnnotote[0],
        annototeId: result.userAnnotote[2],
        userId: result.userAnnotote[1],
        filePath: result.userAnnotote[6]
      }
    }
    var from;
    if (this.user_id == result.userAnnotote[1])
      from = "me";
    else
      from = "follows";
    this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'search', WHICH_STREAM: from });
  }

  load_search_results() {
    this.search_service.get_search_results(this.search_term)
      .subscribe((res) => {
        this._loading = true;
        this.search_results = res.response.docs;
        console.log(this.search_results[0]);
      }, (err) => {
        this._loading = true;
        console.log(err);
      });
  }
}
