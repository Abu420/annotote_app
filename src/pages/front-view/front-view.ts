import { Component } from '@angular/core';

import { Login } from '../login/login';
import { Signup } from '../signup/signup';
import { NavController, NavParams, ToastController, Toast } from 'ionic-angular';
import { AnototeList } from '../anotote-list/anotote-list';
import { StatusBar } from '@ionic-native/status-bar';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { AnototeService } from '../../services/anotote.service';

@Component({
      selector: 'page-front-view',
      templateUrl: 'front-view.html',
      providers: [UtilityMethods]
})
export class FrontViewPage {
      public toast: Toast;
      public page: number;
      public latest_anototes: any;
      public latest_anototes_firstTime_loading: boolean;
      public showFabButton: boolean;

      constructor(public navCtrl: NavController, public statusBar: StatusBar, public utilityMethods: UtilityMethods, private toastCtrl: ToastController, public anototeService: AnototeService) {
            this.showFabButton = true;
            this.page = 0;
      }

      /**
       * View Events
       */
      ionViewDidLoad() {
            this.statusBar.backgroundColorByHexString('000000');
            this.fetch_latest_annototes();
      }

      open_annotote_site() {
            this.utilityMethods.launch('https://annotote.wordpress.com');
      }

      /**
       * API calls
       */
      fetch_latest_annototes() {
            this.latest_anototes_firstTime_loading = true;
            let self = this;
            this.page++;
            this.anototeService.fetchLatestTotes(this.page)
                  .subscribe((response) => {
                        console.log(response);
                        this.latest_anototes = response.data.annototes;
                        this.latest_anototes_firstTime_loading = false;
                  }, (error) => {
                        this.latest_anototes_firstTime_loading = false;
                  });
      }

      /**
       * Methods
       */

      login() {
            this.navCtrl.push(Login, {});
      }

      signup() {
            this.navCtrl.push(Signup, {});
      }

      doInfinite(infiniteScroll) {
            let self = this;
            this.page++;
            this.anototeService.fetchLatestTotes(this.page)
                  .subscribe((response) => {
                        console.log(response);
                        if (response.data.annototes.length % 10 != 0 || response.data.annototes.length == 0)
                              infiniteScroll.enable(false);
                        for (let ano of response.data.annototes) {
                              this.latest_anototes.push(ano);
                        }
                        infiniteScroll.complete();
                  }, (error) => {
                        infiniteScroll.complete();
                  });
            // setTimeout(() => {
            //       console.log('Async operation has ended');
            //       infiniteScroll.complete();
            //       infiniteScroll.enable(false);
            // }, 500);
      }

      openAnototeList(event) {
            // this.navCtrl.push(AnototeList, {});
            this.showFabButton = false;
            this.presentToast();
      }

      presentToast() {
            if (this.toast != null) {
                  this.toast.dismiss();
            }
            this.toast = this.toastCtrl.create({
                  message: 'Register or sign in',
                  position: 'bottom',
                  dismissOnPageChange: true,
                  showCloseButton: false,
                  duration: 1000,
                  cssClass: 'bottom_snakbar'
            });

            this.toast.onDidDismiss(() => {
                  this.showFabButton = true;
            });

            this.toast.present();
      }
}
