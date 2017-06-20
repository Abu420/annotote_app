import { Component, ViewChild } from '@angular/core';

import { Platform, MenuController, Nav, ModalController } from 'ionic-angular';

import { Constants } from '../services/constants.service';
import { Login } from '../pages/login/login';
import { Signup } from '../pages/signup/signup';
import { Home } from '../pages/home/home';
import { Notifications } from '../pages/notifications/notifications';
import { Follows } from '../pages/follows/follows';
import { FrontViewPage } from '../pages/front-view/front-view';
import { Chat } from '../pages/chat/chat';
import { AnototeList } from '../pages/anotote-list/anotote-list';
import { AnototeDetail } from '../pages/anotote-detail/anotote-detail';
import { AnototeEditor } from '../pages/anotote-editor/anotote-editor';
import { AuthenticationService } from "../services/auth.service";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Storage } from '@ionic/storage';


@Component({
  templateUrl: 'app.html',
  providers: [Constants]
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  public rootPage: any;
  pages: Array<{ title: string, component: any }>;

  constructor(public modalCtrl: ModalController, public platform: Platform, public menu: MenuController, public statusBar: StatusBar, public authService: AuthenticationService, public splashScreen: SplashScreen, private push: Push, public storage: Storage) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // let status bar overlay webview
      this.statusBar.overlaysWebView(false);

      // set status bar to white
      this.statusBar.backgroundColorByHexString('#000000');

      /**
       * Sync user from Native storage if any
       */
      var auth_service = this.authService,
        r_page = this.nav,
        s_screen = this.splashScreen;
      this.authService.sync_user().then(function (user) {
        /**
         * Change RootPage Based upon user logged in or not
         */
        if (auth_service.getUser() != null)
          r_page.setRoot(Home);
        else
          r_page.setRoot(FrontViewPage);
        s_screen.hide();
      });

      /**
       * Push Notificaiton
       */
      if (this.platform.is('cordova')) {
        this.push.hasPermission().then((res: any) => {
          if (res.isEnabled) {
            console.log('We have permission to send push notifications');
          } else {
            console.log('We do not have permission to send push notifications');
          }
        });

        const options: PushOptions = {
          android: {
            senderID: '200726631075'
          },
          ios: {
            alert: 'true',
            badge: false,
            sound: 'false'
          },
          windows: {}
        }

        const pushObject: PushObject = this.push.init(options);

        pushObject.on('notification').subscribe((notification: any) => {
          this.notification_handler(notification);
        });

        pushObject.on('registration').subscribe((registration: any) => {
          this.storage.set('device_id', registration.registrationId);
        });

        pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
      }
    });
  }

  notification_handler(notification) {
    console.log(notification)
    let notifications = this.modalCtrl.create(Notifications, null);
    notifications.present();
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
}
