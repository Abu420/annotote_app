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
import { AnototeEditor } from '../pages/anotote-editor/anotote-editor';
import { AuthenticationService } from "../services/auth.service";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Storage } from '@ionic/storage';
import { Deeplinks } from '@ionic-native/deeplinks';
import { Keyboard } from '@ionic-native/keyboard';

@Component({
  templateUrl: 'app.html',
  providers: [Constants]
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  public rootPage: any;
  pages: Array<{ title: string, component: any }>;

  constructor(public keyboard: Keyboard, private deeplinks: Deeplinks, public modalCtrl: ModalController, public platform: Platform, public menu: MenuController, public statusBar: StatusBar, public authService: AuthenticationService, public splashScreen: SplashScreen, private push: Push, public storage: Storage) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // let status bar overlay webview
      this.statusBar.overlaysWebView(false);

      // set status bar to white
      this.statusBar.backgroundColorByHexString('#252525');
      //keyboard
      this.keyboard.hideKeyboardAccessoryBar(false);
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

      this.set_deep_links_routing();

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
            badge: 'false',
            sound: 'false'
          },
          windows: {}
        }

        const pushObject: PushObject = this.push.init(options);

        pushObject.on('notification').subscribe((notification: any) => {
          console.log(notification);
          notification.additionalData.payload.notification = JSON.parse(notification.additionalData.payload.notification);
          if (notification.additionalData.payload.notification.type == 'user:message' && notification.additionalData.foreground) {
            console.log('message type notification');
            return;
          }
          this.notification_handler();
        });

        pushObject.on('registration').subscribe((registration: any) => {
          console.log(registration);
          pushObject.setApplicationIconBadgeNumber(0);
          localStorage.setItem('device_id', registration.registrationId);
        });

        pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
      }
    });
  }

  set_deep_links_routing() {
    if (this.platform.is('cordova'))
      this.deeplinks.route({
        '/anotote': AnototeEditor
      }).subscribe((match) => {
        // match.$route - the route we matched, which is the matched entry from the arguments to route()
        // match.$args - the args passed in the link
        // match.$link - the full link data
        console.log('Successfully matched route', match);
      }, (nomatch) => {
        // nomatch.$link - the full link data
        console.error('Got a deeplink that didn\'t match', nomatch);
      });
  }

  notification_handler() {
    let notifications = this.modalCtrl.create(Notifications, { reload: true });
    notifications.present();
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
}
