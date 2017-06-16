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
import { AnototeDetail } from '../pages/anotote-detail/anotote-detail';
import { ViewOptions } from '../pages/anotote-list/view_options';
import { TagsPopUp } from '../pages/anotote-list/tags';
import { Search } from '../pages/search/search';
import { FollowsPopup } from '../pages/anotote-list/follows_popup';
import { AnototeEditor } from '../pages/anotote-editor/anotote-editor';
/**
 * Directives
 */
import { PressDirective } from '../directives/longPress';
import { TextEditor } from '../directives/editor';
import { AbsoluteDrag } from '../directives/absolute-drag';

import { StatusBar } from '@ionic-native/status-bar';
import { Network } from '@ionic-native/network';
import { IonicStorageModule } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InAppBrowser } from '@ionic-native/in-app-browser';

/**
 * Services
 */
import { UtilityMethods } from '../services/utility_methods'
import { ChatService } from "../services/chat.service";
import { Http, HttpModule, XHRBackend, RequestOptions } from "@angular/http";
import { AnototeService } from "../services/anotote.service";
import { SearchService } from "../services/search.service";
import { Constants } from "../services/constants.service";
import { DefaultRequestOptions } from '../services/http_interceptor';
import { AuthenticationService } from "../services/auth.service";
import { DatetimeService } from "../services/datetime.service";

@NgModule({
  declarations: [
    MyApp,
    Login,
    Signup,
    ForgotPassword,
    Home,
    Chat,
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
    TopOptions,
    FollowsPopup,
    TopInterests,
    AnototeList,
    AnototeDetail,
    AbsoluteDrag,
    PressDirective,
    AnototeEditor
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp),
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
    AnototeDetail,
    AnototeEditor
  ],

  providers: [
    ChatService,
    SearchService,
    AnototeService,
    DatetimeService,
    AuthenticationService,
    Constants,
    {
      provide: RequestOptions, useClass: DefaultRequestOptions
    },
    StatusBar,
    Network,
    InAppBrowser,
    SplashScreen,
    UtilityMethods,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
