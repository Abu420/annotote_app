import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { Login } from '../pages/login/login';
import { Signup } from '../pages/signup/signup';
import { FrontViewPage } from '../pages/front-view/front-view';
import { Profile } from '../pages/follows/follows_profile';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import { Home } from '../pages/home/home';
import { Settings } from '../pages/home/settings';
import { AnototeOptions } from '../pages/anotote-detail/tote_options';
import { CommentDetailPopup } from '../pages/anotote-editor/comment_detail_popup';
import { TopInterests } from '../pages/home/top_interests';
import { TopOptions } from '../pages/home/top_options';
import { Notifications } from '../pages/notifications/notifications';
import { Follows } from '../pages/follows/follows';
import { AnototeList } from '../pages/anotote-list/anotote-list';
import { AnototeDetail } from '../pages/anotote-detail/anotote-detail';
import { ViewOptions } from '../pages/anotote-detail/view_options';
import { AnototeEditor } from '../pages/anotote-editor/anotote-editor';
/**
 * Directives
 */
import { PressDirective } from '../directives/longPress';
import { AbsoluteDrag } from '../directives/absolute-drag';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InAppBrowser } from '@ionic-native/in-app-browser';

/**
 * Services
 */
import { UtilityMethods } from '../services/utility_methods'

@NgModule({
  declarations: [
    MyApp,
    Login,
    Signup,
    Home,
    Follows,
    Profile,
    ViewOptions,
    Notifications,
    FrontViewPage,
    ItemDetailsPage,
    AnototeOptions,
    CommentDetailPopup,
    ListPage,
    Settings,
    TopOptions,
    TopInterests,
    AnototeList,
    AnototeDetail,
    AbsoluteDrag,
    PressDirective,
    AnototeEditor
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],

  entryComponents: [
    MyApp,
    Login,
    Signup,
    Home,
    Follows,
    Profile,
    Settings,
    TopOptions,
    ViewOptions,
    TopInterests,
    CommentDetailPopup,
    Notifications,
    FrontViewPage,
    ItemDetailsPage,
    AnototeOptions,
    ListPage,
    AnototeList,
    AnototeDetail,
    AnototeEditor
  ],

  providers: [
    StatusBar,
    InAppBrowser,
    SplashScreen,
    UtilityMethods,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
