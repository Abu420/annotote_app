import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MyApp } from './app.component';

import { Login } from '../pages/login/login';
import { ForgotPassword } from '../pages/forgot-password/forgot-password';
import { ChangePassword } from '../pages/change-password/change-password';
import { EditProfile } from '../pages/edit-profile/edit-profile';
import { Signup } from '../pages/signup/signup';
import { FrontViewPage } from '../pages/front-view/front-view';
import { Profile } from '../pages/follows/follows_profile';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { Chat } from '../pages/chat/chat';
import { SearchResults } from '../pages/search-results/search-results';
import { Home } from '../pages/home/home';
import { Settings } from '../pages/home/settings';
import { MeOptions } from '../pages/home/me_options';
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
import { DotNavigation } from '../directives/dot-navigation';
import { TextEditor } from '../directives/editor';
import { SearchField } from '../directives/search-field';
import { SwipeVertical } from '../directives/swipe-vertical';
import { DragVertical } from '../directives/drag-vertical';
import { DclWrapper } from '../directives/dcl';
import { AbsoluteDrag } from '../directives/absolute-drag';

import { StatusBar } from '@ionic-native/status-bar';
import { Network } from '@ionic-native/network';
import { SocialSharing } from '@ionic-native/social-sharing';
import { IonicStorageModule } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Deeplinks } from '@ionic-native/deeplinks';

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
import { AuthenticationService } from "../services/auth.service";
import { DatetimeService } from "../services/datetime.service";
import { ChatHeads, chatName, basePath, timeStamp, SanitizeHtmlPipe, notificationTime, chatVote } from "../services/pipes"
import { HttpFactory } from "../services/httpFactory"
import { Push } from '@ionic-native/push';
import { IonicImageViewerModule } from 'ionic-img-viewer';

/**
 * Pipes
 */
import { Highlight } from "../directives/highlight";
import { Safe } from "../services/SafeHtml";
import { OnlyTime } from "../directives/date_pipe";
import { Keyboard } from "@ionic-native/keyboard";
import { DatePipe } from "@angular/common";
import { ChatToteOptions } from '../pages/anotote-list/chat_tote';
import { Streams } from '../services/stream.service';
import { TagsForChat } from '../pages/chat_profileTags/tags';
import { Clipboard } from '@ionic-native/clipboard';
import { EditDeleteMessage } from '../pages/chat/editDelPop';
import { Autosize } from "../directives/ng-autosize/index";
import { OrderModule } from 'ngx-order-pipe';
import { TagsOptions } from "../pages/anotote-list/tags_options";
import { Verification } from "../pages/signup/verificationPopUp";
import { Badge } from '@ionic-native/badge';

@NgModule({
  declarations: [
    MyApp,
    Login,
    Signup,
    ForgotPassword,
    ChangePassword,
    EditProfile,
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
    MeOptions,
    Search,
    TextEditor,
    SearchField,
    SwipeVertical,
    DotNavigation,
    DragVertical,
    TopOptions,
    FollowsPopup,
    TopInterests,
    AnototeList,
    AbsoluteDrag,
    PressDirective,
    AnototeEditor,
    ChatHeads,
    chatName,
    timeStamp,
    basePath,
    OnlyTime,
    DclWrapper,
    Highlight,
    Safe,
    ChatToteOptions,
    TagsForChat,
    EditDeleteMessage,
    notificationTime,
    Autosize,
    chatVote,
    TagsOptions,
    Verification
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    IonicStorageModule.forRoot(),
    BrowserAnimationsModule,
    MomentModule,
    OrderModule,
    IonicImageViewerModule,
    IonicModule.forRoot(MyApp, {
      backButtonText: 'CLOSE',
      iconMode: 'ios',
      mode: 'ios',
      modalEnter: 'modal-slide-in',
      modalLeave: 'modal-slide-out',
      tabsPlacement: 'bottom',
      pageTransition: 'ios-transition',
      toastEnter: 'toast-md-slide-in',
      toastLeave: 'toast-md-slide-out'
    })
  ],
  bootstrap: [IonicApp],

  entryComponents: [
    MyApp,
    Login,
    Signup,
    ForgotPassword,
    ChangePassword,
    EditProfile,
    Home,
    Follows,
    Profile,
    Settings,
    MeOptions,
    TopOptions,
    FollowsPopup,
    ViewOptions,
    TagsPopUp,
    TagsForChat,
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
    AnototeEditor,
    ChatToteOptions,
    EditDeleteMessage,
    TagsOptions,
    Verification
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
    Deeplinks,
    Transfer,
    File,
    Camera,
    FilePath,
    SplashScreen,
    Keyboard,
    UtilityMethods,
    DatePipe,
    Streams,
    Clipboard,
    Badge,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
