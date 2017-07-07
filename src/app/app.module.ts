import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyApp } from './app.component';

import { Login } from '../pages/login/login';
import { ForgotPassword } from '../pages/forgot-password/forgot-password';
import { Signup } from '../pages/signup/signup';
import { FrontViewPage } from '../pages/front-view/front-view';
import { Profile } from '../pages/follows/follows_profile';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { Chat } from '../pages/chat/chat';
import { SearchResults } from '../pages/search-results/search-results';
import { Home } from '../pages/home/home';
import { Settings } from '../pages/home/settings';
import { AnototeOptions } from '../pages/anotote-list/tote_options';
import { CommentDetailPopup } from '../pages/anotote-editor/comment_detail_popup';
import { CreateAnotationPopup } from '../pages/anotote-editor/create_anotation';
import { CreateAnotationOptionsPopup } from '../pages/anotote-editor/create_anotation_options';
import { TopInterests } from '../pages/home/top_interests';
import { TopOptions } from '../pages/home/top_options';
import { Notifications } from '../pages/notifications/notifications';
import { Follows } from '../pages/follows/follows';
import { AnototeList } from '../pages/anotote-list/anotote-list';
import { ViewOptions } from '../pages/anotote-list/view_options';
import { TagsPopUp } from '../pages/anotote-list/tags';
import { Search } from '../pages/search/search';
import { FollowsPopup } from '../pages/anotote-list/follows_popup';
import { AnototeEditor } from '../pages/anotote-editor/anotote-editor';

/**
 * 3rd Party Libraries
 */
import { MomentModule } from 'angular2-moment';

/**
 * Directives
 */
import { PressDirective } from '../directives/longPress';
import { TextEditor } from '../directives/editor';
import { SearchField } from '../directives/search-field';
import { SwipeVertical } from '../directives/swipe-vertical';
import { DclWrapper } from '../directives/dcl';
import { AbsoluteDrag } from '../directives/absolute-drag';

import { StatusBar } from '@ionic-native/status-bar';
import { Network } from '@ionic-native/network';
import { SocialSharing } from '@ionic-native/social-sharing';
import { IonicStorageModule } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen';
//import { ActionSheet } from '@ionic-native/action-sheet';
import { InAppBrowser } from '@ionic-native/in-app-browser';

/**
 * Services
 */
import { UtilityMethods } from '../services/utility_methods'
import { ChatService } from "../services/chat.service";
import { Http, HttpModule, XHRBackend, RequestOptions } from "@angular/http";
import { AnototeService } from "../services/anotote.service";
import { SearchService } from "../services/search.service";
import { NotificationService } from "../services/notifications.service";
import { Constants } from "../services/constants.service";
import { DefaultRequestOptions } from '../services/http_interceptor';
import { AuthenticationService } from "../services/auth.service";
import { DatetimeService } from "../services/datetime.service";
import { ChatHeads } from "../services/pipes"
import { HttpFactory } from "../services/httpFactory"
import { Push } from '@ionic-native/push';

/**
 * Pipes
 */
import { SanitizeHtmlPipe } from '../pages/anotote-editor/anotote-editor';
import { Highlight } from "../directives/highlight";
import { Safe } from "../services/SafeHtml";
import { AnototeContentOptions } from "../pages/home/content_options";

@NgModule({
  declarations: [
    MyApp,
    Login,
    Signup,
    ForgotPassword,
    Home,
    Chat,
    SanitizeHtmlPipe,
    Follows,
    Profile,
    ViewOptions,
    SearchResults,
    TagsPopUp,
    Notifications,
    FrontViewPage,
    ItemDetailsPage,
    AnototeOptions,
    CreateAnotationOptionsPopup,
    CreateAnotationPopup,
    CommentDetailPopup,
    Settings,
    Search,
    TextEditor,
    SearchField,
    SwipeVertical,
    TopOptions,
    FollowsPopup,
    TopInterests,
    AnototeList,
    AbsoluteDrag,
    PressDirective,
    AnototeEditor,
    ChatHeads,
    DclWrapper,
    Highlight,
    Safe,
    AnototeContentOptions
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    BrowserAnimationsModule,
    MomentModule,
    IonicModule.forRoot(MyApp, {
      backButtonText: 'Go Back',
      iconMode: 'ios',
      mode: 'ios',
      modalEnter: 'modal-slide-in',
      modalLeave: 'modal-slide-out',
      tabsPlacement: 'bottom',
      pageTransition: 'ios-transition'
    }
    )
  ],
  bootstrap: [IonicApp],

  entryComponents: [
    MyApp,
    Login,
    Signup,
    ForgotPassword,
    Home,
    Follows,
    Profile,
    Settings,
    TopOptions,
    FollowsPopup,
    ViewOptions,
    TagsPopUp,
    TopInterests,
    Search,
    SearchResults,
    CreateAnotationOptionsPopup,
    CreateAnotationPopup,
    CommentDetailPopup,
    Notifications,
    FrontViewPage,
    ItemDetailsPage,
    AnototeOptions,
    Chat,
    AnototeList,
    AnototeEditor
  ],

  providers: [
    ChatService,
    SearchService,
    AnototeService,
    DatetimeService,
    NotificationService,
    AuthenticationService,
    Constants,
    {
      provide: Http,
      useFactory: HttpFactory,
      deps: [XHRBackend, RequestOptions, UtilityMethods]
    },
    Push,
    StatusBar,
    Network,
    InAppBrowser,
    SocialSharing,
    SplashScreen,
    UtilityMethods,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
