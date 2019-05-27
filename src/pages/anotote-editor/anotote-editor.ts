import { Component, ElementRef, Input, Pipe, ViewChild, Output, Directive, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NavController, Events, Content, NavParams, ModalController } from 'ionic-angular';
import { CommentDetailPopup } from '../anotote-editor/comment_detail_popup';
import { CreateAnotationPopup } from '../anotote-editor/create_anotation';
import { CreateAnotationOptionsPopup } from '../anotote-editor/create_anotation_options';
import { Search } from '../search/search';
import { SocialSharing } from '@ionic-native/social-sharing';
import { InAppBrowser } from '@ionic-native/in-app-browser';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { AnototeService } from '../../services/anotote.service';
import { AuthenticationService } from '../../services/auth.service';
import { StatusBar } from "@ionic-native/status-bar";
import { ChatToteOptions } from '../anotote-list/chat_tote';
import { Chat } from '../chat/chat';
import { Streams } from '../../services/stream.service';
import { TagsPopUp } from '../anotote-list/tags';
import { User } from '../../models/user';
import { ViewOptions } from '../anotote-list/view_options';
import { FollowsPopup } from '../anotote-list/follows_popup';
import { SearchUnPinned } from '../../models/search';
import { AnototeOptions } from "../anotote-list/tote_options";
import { NotificationService } from "../../services/notifications.service";
import { TagsOptions } from "../anotote-list/tags_options";
import { AnototeList } from '../anotote-list/anotote-list';
import { Constants } from '../../services/constants.service';
import { mapper } from '../../models/mapper';
import _ from 'lodash';

@Component({
  selector: 'page-anotote-editor',
  templateUrl: 'anotote-editor.html',
  styles: [
    // ':host /deep/ >>> .highlight_quote, .highlight_comment { background: #f5f6f7; };.highlight_quote:before { content: "*";width: 25px;height: 25px;display: inline-block;text-align: center;background: greenyellow; };'
  ]
})
export class AnototeEditor {
  @ViewChild(Content) content: Content;
  /**
   * Reg Scroll Hide/Show Header
   */
  private ANOTOTE: any;
  private WHICH_STREAM: string;
  private FROM: any;
  private HIGHLIGHT_RECEIVED: any;
  private ANOTOTE_LOADED: boolean;
  private ANOTOTE_LOADING_ERROR: boolean;
  private SAVED_ANOTOTES_LOCALLY: any = [];
  private SAVED_ANOTOTES_LOCALLY_CURRENT: any = [];
  public new_annotote_id = null;
  public start = 0;
  public threshold = 100;
  public slideHeaderPrevious = 0;
  public ionScroll: any;
  public showheader: boolean;
  public hideheader: boolean;
  public loading_check: boolean = false;
  public headercontent: any;
  public toggle_annotation_option: boolean;
  private selectedText: string;
  private selection: any;
  private highlight: any;
  private nodeName: string;
  private innerHTML: string;
  public happendOnce: boolean;
  private selected_highlight: { txt: '', identifier: '', type: '', comment: '', from_where: '' };
  private selection_lock: boolean;
  private text: string; // Anotote article whole text
  private full_text: string = '';
  private tote_id: string;
  private main_anotote_id: string;
  private tote_user_id: string;
  private from_where: string;
  private full_screen_mode: boolean = false;
  private detail_event: any;
  public sel: any;
  public range: any;
  private actual_stream: string;
  private search_obj_to_be_deleted;
  public user: User;
  public moveFabUp: boolean = false;
  public follow_visited = false;
  public loading_message: string = '';
  public commentDetailModalIsOpen: { check: boolean, comment: any } = {
    check: false,
    comment: null
  };
  public normal_footer = true;
  public title_temp = '';
  public titleEditingoff: boolean = true;
  public unread_notification_count: any = 0;
  public loaderLines = new Array(300);
  public url_for_frame: string = '';
  // public for_creating_and_updating_comment: boolean = false;

  private show_anotation_details: (txt: string) => void;

  constructor(public myElement: ElementRef,
    private authService: AuthenticationService,
    private socialSharing: SocialSharing,
    private events: Events,
    private searchService: SearchService,
    private navCtrl: NavController,
    private navParams: NavParams,
    private anotote_service: AnototeService,
    private modalCtrl: ModalController,
    private utilityMethods: UtilityMethods,
    public statusBar: StatusBar,
    private iab: InAppBrowser,
    public runtime: Streams,
    public cd: ChangeDetectorRef,
    public constants: Constants,
    public notificationService: NotificationService) {

    var that = this;
    this.toggle_annotation_option = false;
    this.selection_lock = false;
    this.user = authService.getUser();
    var data = notificationService.get_notification_data()
    this.unread_notification_count = data.unread;
    this.happendOnce = false

    /**
     * Assigning Values
     * if from value is search then new tote
     * else if it is search_result then from search stream
     */
    this.FROM = navParams.get('FROM');
    this.WHICH_STREAM = navParams.get('WHICH_STREAM');
    this.actual_stream = navParams.get('actual_stream');
    this.ANOTOTE_LOADED = false;
    this.ANOTOTE_LOADING_ERROR = false;

    if (navParams.get('FROM') != 'search') {
      this.setThingsUp(null);
    } else {
      // if (navParams.get('needHypothesis'))
      //     this.HMTheorem({
      //         url: navParams.get('url'),
      //         created_at: this.utilityMethods.get_php_wala_time()
      //     })
      // else
      //     this.hypothesisScrapping(navParams.get('url'));
      var params = {
        url: navParams.get('url'),
        created_at: this.utilityMethods.get_php_wala_time(),
        scraped_url: this.constants.HYPOTHESIS_SCRAPPING_BASEURL + navParams.get('url')
      }
      this.HMTheorem(params);
    }
    console.log(navParams.get('url'))
    /**
     * Document Selection Listner
     */
    document.addEventListener("selectionchange", function () {
      var sel = getSelection(),
        selected_txt = sel.toString();
      if (selected_txt != '') {
        var range = sel.getRangeAt(0);
        console.log(range)
        console.log(sel)
        var current_selection = { "startContainer": range.startContainer, "startOffset": range.startOffset, "endContainer": range.endContainer, "endOffset": range.endOffset };
        events.publish('show_tote_options', { flag: true, txt: selected_txt, selection: current_selection, nodeName: sel.anchorNode.parentElement.nodeName, 'innerHTML': sel.anchorNode.parentElement.innerHTML });
      } else {
        events.publish('show_tote_options', { flag: false, txt: '', selection: '', nodeName: sel.anchorNode.parentElement.nodeName, 'innerHTML': sel.anchorNode.parentElement.innerHTML });
      }
    });
    /**
     * Default Full Screen Mode Off
     */
    this.full_screen_mode = false;
    /**
     * Content Scroll hide/show header
     */
    this.showheader = true;
    this.hideheader = false;
  }
  //initializing for all streams
  setThingsUp(anotote) {
    var anotote_from_params = {
      ANOTOTE: anotote == null ? this.navParams.get('ANOTOTE') : anotote,
      HIGHLIGHT_RECEIVED: this.navParams.get('HIGHLIGHT_RECEIVED'),
    };
    if (this.actual_stream == 'anon') {
      this.search_obj_to_be_deleted = this.navParams.get('search_to_delete');
    }
    this.anotote_service.add_page_locally({ url: this.navParams.get('url') });
    this.SAVED_ANOTOTES_LOCALLY = this.anotote_service.get_saved_pages_locally();
    this.SAVED_ANOTOTES_LOCALLY_CURRENT = this.SAVED_ANOTOTES_LOCALLY.length - 1;
    this.load_new_anotote(anotote_from_params, true);
  }

  //1st step not need after HM's work
  //Eliminating loader and initializing page after url is added in search field
  // 1st step SCRAP
  // hypothesisScrapping(url) {
  //     var params = {
  //         url: url,
  //         created_at: this.utilityMethods.get_php_wala_time(),
  //         scraped_url: this.constants.HYPOTHESIS_SCRAPPING_BASEURL + url
  //     }
  //     this.HMTheorem(params);
  //     // this.searchService.hypothesis_scrapping(params).subscribe((success) => {
  //     //     params.scraped_url = success.successMessage;
  //     //     this.HMTheorem(params);
  //     // }, (error) => {
  //     //     if (error.status == 500) {
  //     //         this.utilityMethods.message_alert_with_callback("Ooops", "Couldn't scrape this url.",()=>{
  //     //             this.navCtrl.pop();
  //     //         });
  //     //     } else if (error.code == -1) {
  //     //         this.utilityMethods.internet_connection_error();
  //     //     } else
  //     //         this.utilityMethods.doToast("Couldn't scrap url");
  //     // })
  // }

  //2nd step modify scrapping for anotote
  //Previously 2nd step, now its the only step to scrap a new article
  HMTheorem(params) {
    console.log("params")
    this.searchService.create_anotote(params)
      .subscribe((response) => {
        // added by Hamza
        response.data.userAnnotote.annotote = response.data.annotote;
        if (this.navParams.get('saveThisToMe') && response.data.userAnnotote.isMe == 0)
          this.saveTote(response);
        else
          if (response.data.userAnnotote.isMe == 1) {
            this.tote_id = response.data.userAnnotote.id;
            this.initializeAfterAnon(false);
          } else
            this.setThingsUp(response.data);
      }, (error) => {
        if (error.status == 500) {
          this.utilityMethods.message_alert_with_callback("Ooops", "Couldn't scrape this url.", () => {
            this.navCtrl.pop();
          });
        }
        else if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        } else
          this.utilityMethods.doToast("Couldn't scrap url");
      });
  }

  saveTote(response) {
    console.log(response);
    this.new_annotote_id = response.data.userAnnotote.id;
    var params: any = {
      annotote_id: response.data.annotote.id,
      user_id: this.authService.getUser().id,
      created_at: response.data.annotote.createdAt
    }
    this.anotote_service.save_totes(params).subscribe((result) => {
      this.runtime.follow_first_load = false;
      this.runtime.me_first_load = false;
      this.runtime.top_first_load = false;
      this.tote_id = response.data.userAnnotote.id;
      this.initializeAfterAnon(false);
    }, (error) => {

      if (error.status == 500) {
        this.utilityMethods.message_alert("Ooops", "Couldn't scrape this url.");
      }
      else if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    })
  }

  load_previous_page() {
    if (this.SAVED_ANOTOTES_LOCALLY.length > 1 && this.SAVED_ANOTOTES_LOCALLY_CURRENT > 0) {
      // this.SAVED_ANOTOTES_LOCALLY_CURRENT--;
      // this.load_new_anotote(this.SAVED_ANOTOTES_LOCALLY[this.SAVED_ANOTOTES_LOCALLY_CURRENT], false);
      this.anotote_service.currentPage--;
      this.navCtrl.pop();
    }
  }

  load_next_page() {
    if (this.SAVED_ANOTOTES_LOCALLY.length > 1 && this.SAVED_ANOTOTES_LOCALLY_CURRENT < this.SAVED_ANOTOTES_LOCALLY.length - 1) {
      // this.SAVED_ANOTOTES_LOCALLY_CURRENT++;
      // this.load_new_anotote(this.SAVED_ANOTOTES_LOCALLY[this.SAVED_ANOTOTES_LOCALLY_CURRENT], false);
      this.anotote_service.currentPage++;
      this.navCtrl.push(AnototeEditor, { url: this.SAVED_ANOTOTES_LOCALLY[this.anotote_service.currentPage].url, FROM: 'search', WHICH_STREAM: 'anon', actual_stream: 'anon', saveThisToMe: true, full_screen: true });
    }
  }

  load_new_anotote(ANOTOTE_OBJECT, move_to_highlight_flag?) {

    this.ANOTOTE = ANOTOTE_OBJECT.ANOTOTE;
    this.HIGHLIGHT_RECEIVED = ANOTOTE_OBJECT.HIGHLIGHT_RECEIVED;
    if (this.actual_stream == 'me')
      if (this.WHICH_STREAM == 'me')
        this.title_temp = Object.assign(this.ANOTOTE.userAnnotote.anototeDetail.userAnnotote.annototeTitle);
      else if (this.WHICH_STREAM == 'follows' || (this.FROM == 'search' || this.FROM == 'search_result'))
        this.title_temp = Object.assign(this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.annototeTitle);
      else if (this.WHICH_STREAM == 'top')
        this.title_temp = Object.assign(this.ANOTOTE.anototeDetail.meToteFollowTop.annototeTitle);

    // if (move_to_highlight_flag)
    //     this.HIGHLIGHT_RECEIVED = ANOTOTE_OBJECT.HIGHLIGHT_RECEIVED;
    // else
    //     this.HIGHLIGHT_RECEIVED = null;
    this.tote_id = this.ANOTOTE.userAnnotote.id;
    if (this.FROM == 'anotote_list')
      this.from_where = 'anotote_list';
    else
      this.from_where = 'new_anotote';

    if (this.actual_stream == 'me') {
      this.scrape_anotote(this.ANOTOTE.meFilePath);
    } else if (this.actual_stream == 'follows') {
      this.scrape_anotote(this.ANOTOTE.followerFilePath);
    } else if (this.actual_stream == 'top') {
      this.scrape_anotote(this.ANOTOTE.topFilePath);
    } else if (this.actual_stream == 'anon') {
      this.ANOTOTE.userAnnotote.userAnnotote = this.ANOTOTE.userAnnotote;
      this.scrape_anotote(this.ANOTOTE.userAnnotote.filePath);
    }
  }

  saveTitle(anotote) {
    // this.showLoading("Saving title");
    var params = {
      annotote_id: this.WHICH_STREAM == 'me' ? anotote.userAnnotote.id : (this.WHICH_STREAM == 'top' ? this.ANOTOTE.anototeDetail.meToteFollowTop.id : this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.id : this.ANOTOTE.meToteFollowTop.id),
      annotote_title: this.title_temp,
      updated_at: this.utilityMethods.get_php_wala_time()
    }
    this.anotote_service.saveTitle(params).subscribe((success) => {
      // this.hideLoading();
      if (this.WHICH_STREAM == 'me') {
        anotote.userAnnotote.anototeDetail.userAnnotote.annototeTitle = success.data.annotote.annototeTitle;
        this.runtime.follow_first_load = false;
        this.runtime.top_first_load = false;
      } else {
        this.runtime.me_first_load = false;
        if (this.WHICH_STREAM == 'follows') {
          this.runtime.top_first_load;
          anotote.userAnnotote.anototeDetail.meToteFollowTop.annototeTitle = success.data.annotote.annototeTitle;
        } else if (this.WHICH_STREAM == 'top') {
          this.runtime.follow_first_load;
          anotote.anototeDetail.meToteFollowTop.annototeTitle = success.data.annotote.annototeTitle;
        } else if (this.WHICH_STREAM == 'anon') {
          this.runtime.me_first_load = false;
          this.runtime.follow_first_load = false;
          this.runtime.top_first_load = false;
          anotote.meToteFollowTop.annototeTitle = success.data.annotote.annototeTitle;
        }
      }
      this.titleEditingoff = true;
    }, (error) => {
      this.hideLoading();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      } else
        this.toastInFooter("Couldn't update title");
    })
  }

  editTitle() {
    var params = {
      tag: this.WHICH_STREAM == 'me' ? this.ANOTOTE.userAnnotote.anototeDetail.userAnnotote.annototeTitle : (this.WHICH_STREAM == 'top' ? this.ANOTOTE.anototeDetail.meToteFollowTop.annototeTitle : (this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.annototeTitle : this.ANOTOTE.meToteFollowTop.annototeTitle)),
      is_tag: false
    }
    let tagOptions = this.modalCtrl.create(TagsOptions, params);
    tagOptions.onDidDismiss(data => {
      if (data.delete) {
        this.title_temp = data.title
        this.saveTitle(this.ANOTOTE);
      }
    })
    tagOptions.present();
  }


  ngOnInit() {
    // Ionic scroll element
    this.ionScroll = this.myElement.nativeElement.getElementsByClassName('scroll-content')[0];
    // On scroll function
    this.ionScroll.addEventListener("scroll", () => {
      if (!this.full_screen_mode) {
        this.slideHeaderPrevious = 0;
        return;
      }
      if (this.ionScroll.scrollTop - this.start > this.threshold) {
        this.showheader = true;
        this.hideheader = false;
        this.statusBar.show();
      } else {
        this.showheader = false;
        this.hideheader = true;
        this.statusBar.hide();
      }
      if (this.slideHeaderPrevious >= this.ionScroll.scrollTop - this.start) {
        this.showheader = false;
        this.hideheader = true;
        this.statusBar.hide();
      }
      this.slideHeaderPrevious = this.ionScroll.scrollTop - this.start;
    });
  }

  /**
   * Page LifeCycle Events
   */
  ionViewDidLoad() {
    if (this.navParams.get('full_screen')) {
      this.change_full_screen_mode();
    }
    this.events.subscribe('show_anotation_details', (data) => {
      this.presentCommentDetailModal(data.txt);
    });
  }

  ionViewWillLeave() {
    if (this.commentDetailModalIsOpen.check && this.navCtrl.last().isOverlay == false) {
      this.events.publish('closeModal');
    }
  }

  ionViewDidEnter() {
    if (this.navParams.get('WHICH_STREAM') == 'me') {
      this.statusBar.backgroundColorByHexString('#3bde00');
    } else if (this.navParams.get('WHICH_STREAM') == 'follows')
      this.statusBar.backgroundColorByHexString('#f4e300');
    else if (this.navParams.get('WHICH_STREAM') == 'top')
      this.statusBar.backgroundColorByHexString('#fb9df0');
    else
      this.statusBar.backgroundColorByHexString('#323232');

    this.events.subscribe('show_tote_options', (data) => {
      if (this.actual_stream == 'me' || this.actual_stream == 'anon') {
        this.toggle_annotation_option = data.flag;
        if (this.toggle_annotation_option)
          this.moveFabUp = true;
        else
          this.moveFabUp = false;
        if (data.flag && !this.selection_lock) {
          this.selectedText = data.txt;
          this.selection = data.selection;
          this.nodeName = data.nodeName;
          this.innerHTML = data.innerHTML
        }
        setTimeout(() => {
          this.content.resize();
          this.cd.detectChanges();
        }, 500);


      }
    });
  }


  ionViewWillUnload() {
    // this.events.unsubscribe('show_anotation_details');
    // this.events.unsubscribe('show_tote_options');
  }

  /**
   * Scrap anotote
   */
  scrape_anotote(file_path) {
    this.searchService.get_anotote_content(file_path)
      .subscribe((response_content) => {
        this.text = response_content.text();
        var that = this;
        if (this.HIGHLIGHT_RECEIVED != null)
          setTimeout(() => {
            // this.itemsShowHide();
            that.scrollTo(that.HIGHLIGHT_RECEIVED.identifier);
          }, 1000);
        // else {
        //     setTimeout(() => {
        //         this.itemsShowHide();
        //         this.cd.detectChanges();
        //     }, 1000)
        // }
        this.ANOTOTE_LOADED = true;
        this.ANOTOTE_LOADING_ERROR = false;
      }, (error) => {
        this.ANOTOTE_LOADED = true;
        this.ANOTOTE_LOADING_ERROR = true;
        if (error.code == -1 || error.code == -2) {
          this.utilityMethods.internet_connection_error();
        }
      });
  }

  // stripAndExecuteScript(text) {
  //     var scripts = '';
  //     var cleaned = text.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function () {

  //         scripts += arguments[1] + '\n';
  //         return '';
  //     });

  //     // if (window.execScript){
  //     //     window.execScript(scripts);
  //     // } else {
  //     // var head = document.getElementsByTagName('head')[0];
  //     // var scriptElement = document.createElement('script');
  //     // scriptElement.setAttribute('type', 'text/javascript');
  //     // scriptElement.innerText = scripts;
  //     // head.appendChild(scriptElement);
  //     // head.removeChild(scriptElement);
  //     // }
  //     return cleaned;
  // }

  change_full_screen_mode() {
    this.normal_footer = false;
    console.log(this.navParams.get('ANOTOTE'))
    console.log(this.user);
    let user_tote_id = this.new_annotote_id;
    if (this.navParams.get('ANOTOTE') != undefined) {
      user_tote_id = this.navParams.get('ANOTOTE')['userToteId'];
    }
    if (this.navParams.get('ANOTOTE') == undefined)
      this.url_for_frame = this.navParams.get('url')
    else
      this.url_for_frame = this.navParams.get('ANOTOTE').userAnnotote.annotote.link

    var options = ''

    if (this.url_for_frame.includes('https://www.google.com/amp/s/')) {
      this.url_for_frame = 'http://' + this.url_for_frame.split('https://www.google.com/amp/s/')[1]
    }

    console.log('https://annotote.codingpixel.co/api/getInjectionFile?key=' + this.user.access_token + '&tote_id=' + user_tote_id + '&user_id=' + this.user.id);


    if (this.utilityMethods.whichPlatform() != 'desktop') {
      if (this.utilityMethods.whichPlatform() == 'ios') {
        options = 'zoom=no,location=yes,hidenavigationbuttons=yes,closebuttoncaption=Close,toolbar=yes,fullscreen=yes,presentationstyle=pagesheet,toolbarposition=bottom,toolbarcolor=#3cde01,hidden=yes';
      } else if (this.utilityMethods.whichPlatform() == 'android') {
        options = 'zoom=no,location=yes,hidenavigationbuttons=yes,closebuttoncaption="Close",toolbar=no,footer=yes,toolbarcolor=#3cde01,hidden=yes'
      }
      const browser = this.iab.create(this.url_for_frame, '_blank', options);

      let temp = true
      browser.on('loadstop').subscribe(event => {

        this.normal_footer = true;
        browser.show();

        if (temp) {
          browser.insertCSS({ file: `https://annotote.codingpixel.co/public/css/fullview.css` })
          browser.executeScript({ file: `https://annotote.codingpixel.co/api/getInjectionFile?key=` + this.user.access_token + `&tote_id=` + user_tote_id + `&user_id=` + this.user.id })
          temp = false;
        }
      });
      browser.on('exit').subscribe(event => {

        this.normal_footer = true;

      })
    } else {
      var x = window.open(this.url_for_frame, "_blank") // open a blank tab;
      var temp = `https://annotote.codingpixel.co/api/getInjectionFile?key=` + this.user.access_token + `&tote_id=` + user_tote_id + `&user_id=` + this.user.id;




    }


    //this.full_screen_mode = !this.full_screen_mode;
    // this.moveFabUp = !this.moveFabUp;
    // if (this.full_screen_mode == true) {
    //   if (this.navParams.get('FROM') != 'search') {
    //     this.toggle_annotation_option = false;
    //     this.ANOTOTE_LOADED = true;
    //     this.showheader = false;
    //     this.hideheader = true;
    //     this.statusBar.hide();
    //     console.log(this.ANOTOTE)
    //     //not required after HMTheorem
    //     //taking iframe functionality out of equation
    //     if (this.actual_stream == 'me') {
    //       var temp = this.ANOTOTE.meFilePath.split('/');
    //     } else if (this.actual_stream == 'follows') {
    //       var temp = this.ANOTOTE.followerFilePath.split('/');
    //     } else if (this.actual_stream == 'top') {
    //       var temp = this.ANOTOTE.topFilePath.split('/');
    //     } else if (this.actual_stream == 'anon') {
    //       var temp = this.ANOTOTE.userAnnotote.filePath.split('/');
    //     }
    //     var name = temp[temp.length - 1].split('.')[0];
    //     console.log("hello")
    //     console.log(this.navParams.get('ANOTOTE'))
    //     this.happendOnce = false
    //     // this.url_for_frame = "https://cors-anywhere.herokuapp.com/" + this.constants.iframe_baseurl + name + '.html?stream=' + this.actual_stream + '&&toteId=' + this.ANOTOTE.userAnnotote.id + "&&token=" + localStorage.getItem('_token') + "&&dummy=dum";


    //     // browser.close();
    //     //console.log(this.url_for_frame)
    //     // setTimeout(() => {

    //     //     // iframe.onload = () => {
    //     //         // setTimeout(() => {
    //     //         //     var classes = this.WHICH_STREAM == 'top' ? (this.ANOTOTE.annotote.htmlClass == null ? '' : this.ANOTOTE.annotote.htmlClass) : (this.ANOTOTE.userAnnotote.annotote.htmlClass == null ? '' : this.ANOTOTE.userAnnotote.annotote.htmlClass)
    //     //         //     iframe.contentDocument.body.setAttribute('class', this.actual_stream + ' ' + classes);
    //     //         //     iframe.contentDocument.body.setAttribute('id', 'chuddu_bodyOverride');
    //     //         //     var tags = iframe.contentDocument.body.getElementsByTagName('div');
    //     //         //     for (let tag of tags) {
    //     //         //         if (tag.offsetWidth > window.innerWidth) {
    //     //         //             tag.setAttribute('style', "max-width:" + (window.innerWidth - 50) + "px !important;");
    //     //         //             this.cd.detectChanges();
    //     //         //         }
    //     //         //     }
    //     //         //     var imgs = iframe.contentDocument.body.getElementsByTagName('img');
    //     //         //     for (let img of imgs) {
    //     //         //         if (img.offsetWidth > window.innerWidth) {
    //     //         //             img.setAttribute('style', "max-width:" + (window.innerWidth - 50) + "px !important;");
    //     //         //             this.cd.detectChanges();
    //     //         //         }
    //     //         //     }
    //     //         //     this.cd.detectChanges();
    //     //         // }, 500);

    //     //     // }
    //     // }, 500);
    //   } else {
    //     this.toggle_annotation_option = false;
    //     this.ANOTOTE_LOADED = true;
    //     this.showheader = false;
    //     this.hideheader = true;
    //     this.statusBar.hide();
    //     this.url_for_frame = this.navParams.get('url')
    //   }
    // } else {
    //   this.ANOTOTE_LOADED = false;
    //   this.ANOTOTE_LOADED = true;
    //   this.showheader = true;
    //   this.hideheader = false;
    //   if (this.statusBar.isVisible == false)
    //     this.statusBar.show();
    //   var anotote_obj = {
    //     ANOTOTE: this.ANOTOTE,
    //     HIGHLIGHT_RECEIVED: null,
    //   };
    //   this.load_new_anotote(anotote_obj);
    // }
    // setTimeout(() => {
    //   this.content.resize();
    // }, 200);


  }
  iframe_error() {
    console.log("error")
    if (this.navParams.get('FROM') != 'search') {
      this.url_for_frame = this.constants.PROXY_SERVER + this.navParams.get('ANOTOTE').userAnnotote.annotote.link
    } else {
      this.url_for_frame = this.constants.PROXY_SERVER + this.navParams.get('url')
    }
  }

  iframeLoaded(event) {

    setTimeout(() => {
      var iframe: any = document.getElementById('browsed');
      if (iframe.contentDocument) {
        // iframe.contentDocument.body.setAttribute('class', this.actual_stream);
        // iframe.contentDocument.addEventListener('selectionchange', (e) => {
        //     var sel = iframe.contentDocument.getSelection(),
        //         selected_txt = sel.toString();
        //     if (selected_txt != '') {
        //         this.range = iframe.contentDocument.createRange();
        //         this.range.setStart(sel.baseNode, sel.baseOffset);
        //         this.range.setEnd(sel.extentNode, sel.extentOffset);
        //         this.sel = _.clone(sel);
        //         if (sel.baseNode != null)
        //             this.authService.store(this.sel, this.range);
        //         console.log(this.sel);
        //         console.log(this.range);
        //         var current_selection = { "startContainer": this.range.startContainer, "startOffset": this.range.startOffset, "endContainer": this.range.endContainer, "endOffset": this.range.endOffset };
        //         this.events.publish('show_tote_options', { flag: true, txt: selected_txt, selection: current_selection });
        //         this.cd.detectChanges();
        //     } else {
        //         if (this.toggle_annotation_option == false) {
        //             this.events.publish('show_tote_options', { flag: false, txt: '', selection: '' });
        //             this.cd.detectChanges();
        //         } else {
        //             setTimeout(() => {
        //                 this.toggle_annotation_option = false;
        //             }, 500);
        //         }
        //     }
        // })
        iframe.contentDocument.addEventListener('touchstart', (event) => {
          event.preventDefault();
          if (event.target.localName == 'highlight_quote')
            this.editor_click(event);
          else if (event.target.href) {
            this.editor_click(event);
          }
        })
        iframe.contentDocument.addEventListener('addedAnnotation', (event) => {
          console.log(event);
          console.log("event catched from iframe");
        })
      }



      if (this.happendOnce == false) {
        console.log("inside")

        try {
          var iframe: any = document.getElementById('browsed');

          console.log(iframe)
        } catch (e) {
          console.log(e)
        }


        // if (iframe.contentDocument == null) {
        //   if (this.navParams.get('FROM') != 'search') {
        //     this.url_for_frame = this.constants.PROXY_SERVER + this.navParams.get('ANOTOTE').userAnnotote.annotote.link
        //   } else {
        //     this.url_for_frame = this.constants.PROXY_SERVER + this.navParams.get('url')
        //   }
      }



      this.happendOnce = true
    }, 1000);


  }

  //showHide scenario changed after HMTheorem implementation.
  // itemsShowHide() {
  //     var elements = document.querySelectorAll('[data-trick="annotote_trick"]');
  //     for (var i = 0; i < elements.length; i++) {
  //         if (this.full_screen_mode) {
  //             elements[i].setAttribute('style', 'display:block');
  //         } else {
  //             elements[i].setAttribute('style', 'display:none');
  //         }
  //     }
  //     var elements = document.querySelectorAll('[data-header="annotote_trick"]');
  //     for (var i = 0; i < elements.length; i++) {
  //         if (this.full_screen_mode) {
  //             elements[i].setAttribute('style', 'display:block');
  //         } else {
  //             elements[i].setAttribute('style', 'display:none');
  //         }
  //     }
  // }

  add_to_me_stream() {
    var params = {
      anotote: this.ANOTOTE,
      stream: this.WHICH_STREAM,
      from: 'editor',
      findChatter: false
    }
    let chatTote = this.modalCtrl.create(ChatToteOptions, params);
    chatTote.onDidDismiss((data) => {
      if (data.chat) {
        if (!data.group) {
          if (data.title)
            this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: true, anotote_id: this.ANOTOTE.userAnnotote.id, title: data.title, full_tote: this.ANOTOTE });
          else
            this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: false, anotote_id: null, title: '' });
        } else {
          this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: false, anotote_id: null, title: '', full_tote: data.group });
        }
      } else if (data.save) {
        if (this.WHICH_STREAM == 'anon') {
          this.loading_message = 'Saving annotation';
          this.loading_check = true;
          var params = {
            user_tote_id: this.tote_id,
            created_at: this.utilityMethods.get_php_wala_time()
          }
          console.log(params)
          this.searchService.addToMeStream(params).subscribe((success) => {
            this.initializeAfterAnon();
          }, (error) => {
            this.utilityMethods.hide_loader();
            if (error.code == -1) {
              this.utilityMethods.internet_connection_error();
            }
          })
        } else {
          var data: any = {
            annotote_id: this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.annotote.id : this.ANOTOTE.annotote.id,
            user_id: this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.anototeDetail.user.id : this.ANOTOTE.anototeDetail.user.id,
            created_at: this.utilityMethods.get_php_wala_time()
          }
          this.showLoading("Saving");
          this.anotote_service.save_totes(data).subscribe((result) => {
            this.hideLoading();
            if (result.status == 1) {
              this.ANOTOTE.isMe = 1;
              // if (result.data.save_count == 1) {
              if (this.WHICH_STREAM == 'top') {
                this.ANOTOTE.anototeDetail.isMe = 1;
                this.ANOTOTE.anototeDetail.meToteFollowTop = result.data.meToteFollowTop[0];
                this.runtime.follow_first_load = false;
              } else {
                this.ANOTOTE.userAnnotote.anototeDetail.isMe = 1;
                this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop = result.data.meToteFollowTop[0];
                this.runtime.top_first_load = false;
              }
              this.runtime.me_first_load = false;
              this.showMeHighlights(this.ANOTOTE);
              // }
            }
          }, (error) => {
            this.hideLoading();
            if (error.code == -1) {
              this.utilityMethods.internet_connection_error();
            }
          })
        }

      } else if (data.bookmark) {
        var bookmark = new SearchUnPinned(1,
          this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.annotote.title : this.ANOTOTE.annotote.title,
          this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.annotote.link : this.ANOTOTE.annotote.link,
          this.user.id,
          this.ANOTOTE.userAnnotote.id);
        if (this.searchService.AlreadySavedSearches(bookmark.term)) {
          this.searchService.saved_searches.unshift(bookmark);
          this.utilityMethods.doToast("Bookmarked");
        } else {
          this.utilityMethods.doToast("Already bookmarked");
        }
        // var link = [];
        // var title = [];
        // link.push(this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.annotote.link : this.ANOTOTE.annotote.link)
        // title.push(this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.annotote.title : this.ANOTOTE.annotote.title)
        // var paraams: any = {
        //     user_tote_id: this.ANOTOTE.userAnnotote.id,
        //     user_id: this.user.id,
        //     links: link,
        //     tote_titles: title,
        //     created_at: this.utilityMethods.get_php_wala_time()
        // }
        // this.showLoading('Bookmarking');
        // this.anotote_service.bookmark_totes(paraams).subscribe((result) => {
        //     this.hideLoading();
        //     if (result.status == 1) {
        //         if (result.data.bookmarks.length > 0) {
        //             this.searchService.saved_searches.unshift(result.data.bookmarks[0]);
        //             this.toastInFooter("Bookmarked");
        //         } else if (result.data.exist_count == 1) {
        //             this.toastInFooter("Already Bookmarked");
        //         }
        //     }
        // }, (error) => {
        //     this.utilityMethods.hide_loader();
        //     if (error.code == -1) {
        //         this.utilityMethods.internet_connection_error();
        //     } else {
        //         this.toastInFooter("Couldn't bookmark.");
        //     }
        // })
      } else if (data.browser) {
        if (this.WHICH_STREAM != 'me')
          this.navCtrl.push(AnototeList, { color: 'me', from: 'listing', url: data.tote }, { animate: false });
        else
          this.navCtrl.push(AnototeEditor, { url: data.tote, FROM: 'search', WHICH_STREAM: 'anon', actual_stream: 'anon', saveThisToMe: true });
      }
    })
    chatTote.present();
  }

  initializeAfterAnon(initialized = true) {
    var params = {
      user_id: this.user.id,
      anotote_id: this.tote_id,
      time: this.utilityMethods.get_php_wala_time()
    }
    this.anotote_service.fetchToteDetails(params)
      .subscribe((result) => {
        console.log(result)
        this.hideLoading();
        this.ANOTOTE = result.data.annotote;
        this.ANOTOTE.userAnnotote.anototeDetail = result.data.annotote;
        this.ANOTOTE.userAnnotote.annotote = result.data.annotote.annotote;
        this.title_temp = result.data.annotote.userAnnotote.annototeTitle;
        this.ANOTOTE.userAnnotote.annototeHeighlights = result.data.annotote.highlights;
        this.ANOTOTE.active_tab = 'me';
        this.ANOTOTE.isMe = 1;
        this.ANOTOTE.userAnnotote.isMe = 1;
        this.ANOTOTE.followers = this.ANOTOTE.follows;
        this.actual_stream = 'me';
        this.WHICH_STREAM = 'me';
        this.ANOTOTE.meFilePath = this.ANOTOTE.userAnnotote.filePath;
        this.ANOTOTE.my_highlights = result.data.annotote.highlights;
        console.log(this.ANOTOTE)
        this.statusBar.backgroundColorByHexString('#3bde00');
        this.searchService.saved_searches.splice(this.searchService.saved_searches.indexOf(this.search_obj_to_be_deleted), 1);
        if (initialized == false)
          this.setThingsUp(this.ANOTOTE)
        else {
          this.ANOTOTE_LOADED = true;
          this.runtime.me_first_load = false;
          this.runtime.top_first_load = false;
        }
      }, (error) => {
        this.hideLoading();
        this.ANOTOTE_LOADED = true;
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
  }

  private highlight_(com_or_quote, identifier, comment) {
    try {
      if (com_or_quote == 'comment') {
        // if (!this.full_screen_mode) {
        var selection = this.sel;
        var range = this.range;
        // }
        //  else {
        //     var temp = this.authService.retrieve();
        //     var selection = temp.selection;
        //     var range = temp.range;
        // }
      } else {
        var selection: any = window.getSelection();
        var range: any = document.createRange();
        range.setStart(selection.baseNode, selection.baseOffset);
        range.setEnd(selection.extentNode, selection.extentOffset);
      }
      if (this.checkIfItOverlaps(range) == true) {
        this.utilityMethods.doToast("You cannot overlap already annototed text.");
        return false;
      }
      var newNode = document.createElement("highlight_quote");
      newNode.setAttribute("data-selectedtxt", this.selectedText);
      newNode.setAttribute("data-identifier", identifier);
      newNode.id = identifier;
      if (com_or_quote == 'comment') {
        newNode.setAttribute("class", "highlight_comment");
        newNode.setAttribute("data-comment", comment);
      } else
        newNode.setAttribute("class", "highlight_quote");
      newNode.appendChild(range.extractContents());
      range.insertNode(newNode);
      // if (selection.baseNode)
      //     selection.removeAllRanges();
      return true;
    } catch (e) {
      this.utilityMethods.message_alert("Oops", "You cannot overlap already annototed text.");
      this.selection_lock = false;
      this.selectedText = '';
      return false;
    }
  }

  checkIfItOverlaps(range): boolean {
    var node = document.createElement('temp');
    node.appendChild(range.cloneContents());
    return node.innerHTML.includes('highlight_quote');
    // var node = selection.baseNode.nextElementSibling;
    // while (node != null) {
    //     if (node.localName == 'highlight_quote') {

    //         this.toastInFooter('The selection overlapps with the already annotated text.');
    //         this.selection_lock = false;
    //         return false;
    //     }
    //     node = node.nextElementSibling;
    // }
    // return true;

  }

  scrollTo(identifier: string) {
    let element: any = document.querySelectorAll('[data-identifier="' + identifier + '"]');
    if (element != null && element.length > 0) {
      let yOffset = element[0].offsetTop;
      this.content.scrollTo(0, yOffset, 2000)
    }
  }

  editor_click(event) {
    if (this.full_screen_mode == false) {
      var identifier = event.target.getAttribute("data-identifier");
      if (identifier) {
        if (this.commentDetailModalIsOpen.check) {
          if (this.commentDetailModalIsOpen.comment && this.commentDetailModalIsOpen.comment.identifier == identifier) {
            var element = document.getElementById(identifier);
            element.classList.remove('greyOut');
            this.events.publish('closeModal');
            this.commentDetailModalIsOpen.check = false;
            this.commentDetailModalIsOpen.comment = null;
            return;
          } else if (this.commentDetailModalIsOpen.comment) {
            this.scrollTo(identifier);
            var element = document.getElementById(this.commentDetailModalIsOpen.comment.identifier);
            element.classList.remove('greyOut');
            this.events.publish('closeModal');
          } else {
            this.events.publish('closeModal');
          }
        }
        var element = document.getElementById(identifier);
        element.classList.add('greyOut');
        try {
          this.selected_highlight = {
            txt: this.get_highlight(event.target.getAttribute("data-identifier")).highlightText,
            identifier: event.target.getAttribute("data-identifier"),
            type: event.target.getAttribute("class"),
            from_where: '',
            comment: event.target.getAttribute("data-comment")
          };
          this.commentDetailModalIsOpen.check = true;
          this.commentDetailModalIsOpen.comment = this.selected_highlight;
          this.presentCommentDetailModal(this.selected_highlight, event.target);
        } catch (exception) {
          this.toastInFooter('Cannot show annotation for anon stream')
        }
      } else if (event.target.href) {
        event.preventDefault();
        if (this.full_screen_mode) {
          this.anotote_service.currentPage++;
          this.navCtrl.push(AnototeEditor, { url: event.target.href, FROM: 'search', WHICH_STREAM: 'anon', actual_stream: 'anon', saveThisToMe: true, full_screen: true });
        }
      }
    } else {
      try {
        var identifier = event.target.getAttribute('data-identifier');
        if (identifier) {
          var iframe: any = document.getElementById('browsed');
          if (this.commentDetailModalIsOpen.check) {
            if (this.commentDetailModalIsOpen.comment && this.commentDetailModalIsOpen.comment.identifier == identifier) {
              var element: HTMLElement = iframe.contentDocument.getElementById(identifier);
              element.classList.remove('greyOut');
              this.events.publish('closeModal');
              this.commentDetailModalIsOpen.check = false;
              this.commentDetailModalIsOpen.comment = null;
              return;
            } else if (this.commentDetailModalIsOpen.comment) {
              this.scrollTo(identifier);
              var element: HTMLElement = iframe.contentDocument.getElementById(this.commentDetailModalIsOpen.comment.identifier);
              element.classList.remove('greyOut');
              this.events.publish('closeModal');
            } else {
              this.events.publish('closeModal');
            }
          }
          iframe.contentDocument.getElementById(identifier).classList.add('greyOut');
          this.selected_highlight = {
            txt: this.get_highlight(identifier).highlightText,
            identifier: identifier,
            type: event.target.getAttribute("class"),
            from_where: '',
            comment: event.target.getAttribute("data-comment")
          };
          this.commentDetailModalIsOpen.check = true;
          this.commentDetailModalIsOpen.comment = this.selected_highlight;
          this.presentCommentDetailModal(this.selected_highlight, event.target);
        } else if (event.target.href) {
          event.preventDefault();
          if (this.full_screen_mode) {
            this.anotote_service.currentPage++;
            this.navCtrl.push(AnototeEditor, { url: event.target.href, FROM: 'search', WHICH_STREAM: 'anon', actual_stream: 'anon', saveThisToMe: true, full_screen: true });
          }
        }

      } catch (exception) {
        this.toastInFooter('Cannot show annotation from full screen mode');
      }
    }
  }

  comment_it() {
    this.selection_lock = true;
    this.toggle_annotation_option = false;
    this.content.resize();
    this.presentCreateAnotationModal();
  }

  quote_it() {
    this.selection_lock = true;
    this.toggle_annotation_option = false;
    this.content.resize();
    this.add_annotation_api('quote', null, [], this.selectedText);
  }

  share_it() {
    this.selection_lock = true;
    this.toggle_annotation_option = false;
    this.content.resize();
    this.utilityMethods.share_content_native('Deep Link', 'Anotote Text Sharing', null, null);
  }

  openSearchPopup() {
    var url = null;
    this.statusBar.backgroundColorByHexString('#323232');
    let searchModal = this.modalCtrl.create(Search, {});
    searchModal.onDidDismiss(data => {
      // if (data.editor_check) {
      //     if (this.WHICH_STREAM == 'me')
      //         this.statusBar.backgroundColorByHexString('#3bde00');
      //     else if (this.WHICH_STREAM == 'follows')
      //         this.statusBar.backgroundColorByHexString('#f4e300');
      //     else if (this.WHICH_STREAM == 'top')
      //         this.statusBar.backgroundColorByHexString('#fb9df0');
      // }
      if (data.go_to_browser) {
        if (data.neworold) {
          this.navCtrl.push(AnototeEditor, { url: data.anotote, FROM: 'search', WHICH_STREAM: 'anon', actual_stream: 'anon' });
        } else {
          var anotote = new mapper(data.anotote, this.authService.getUser())
          this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'search_result', WHICH_STREAM: 'anon', HIGHLIGHT_RECEIVED: null, actual_stream: anotote.active_tab });
        }
      }
    });
    searchModal.present();
  }

  presentCommentDetailModal(highlight, element?) {
    var opts = {
      cssClass: 'noBackDrop',
      enableBackdropDismiss: true,
      showBackdrop: true
    }
    // if (this.ANOTOTE.active_tab != 'me') {
    //     opts.cssClass = ''
    // }
    let commentDetailModal = this.modalCtrl.create(CommentDetailPopup, {
      txt: highlight.txt,
      identifier: highlight.identifier,
      type: highlight.type,
      comment: highlight.comment,
      stream: this.actual_stream,
      anotation: this.get_highlight(highlight.identifier),
      follower_name: this.ANOTOTE.selected_follower_name != null ? this.ANOTOTE.selected_follower_name : '',
      total_followers: (this.WHICH_STREAM == 'top') ? this.ANOTOTE.follows.length : this.ANOTOTE.followers.length
    }, opts);
    commentDetailModal.onDidDismiss(data => {
      element.classList.remove('greyOut');
      if (this.commentDetailModalIsOpen.check && this.commentDetailModalIsOpen.comment.identifier == highlight.identifier) {
        this.commentDetailModalIsOpen.check = false;
        this.commentDetailModalIsOpen.comment = null;
      }
      if (data.delete) {
        this.utilityMethods.confirmation_message("Are you sure ?", "Do you really want to delete this annotation ?", () => {
          this.remove_annotation_api(highlight.identifier, element);
        })
      } else if (data.update) {
        var tags = [];
        if (data.hash.length > 0) {
          for (var i = 0; i < data.hash.length; i++) {
            var tag = {
              text: data.hash[i],
              tag_id: 3,
            }
            tags.push(tag);
          }
        }
        if (data.cash.length > 0) {
          for (var i = 0; i < data.cash.length; i++) {
            var tag = {
              text: data.cash[i],
              tag_id: 4,
            }
            tags.push(tag);
          }
        }
        if (data.uptags.length > 0) {
          for (var i = 0; i < data.uptags.length; i++) {
            var tag = {
              text: data.uptags[i],
              tag_id: 1,
            }
            tags.push(tag);
          }
        }
        if (data.mentions.length > 0) {
          for (var i = 0; i < data.mentions.length; i++) {
            var tag = {
              text: data.mentions[i],
              tag_id: 2,
            }
            tags.push(tag);
          }
        }
        // if (tags.length > 0)
        this.saveTags(highlight.identifier, tags);
        this.update_annotation_api(highlight.id, data.anototeTxt, data.comment, highlight.identifier, element);
      } else if (data.share) {
        this.utilityMethods.share_content_native('Annotote', highlight.txt, null, null);
      } else if (data.upvote) {
        this.upvote(element.getAttribute('data-identifier'));
      } else if (data.downvote) {
        this.downvote(element.getAttribute('data-identifier'))
      } else if (data.tags) {
        //this.show_annotation_tags(element.getAttribute('data-identifier'))
        if (data.link == false) {
          this.statusBar.backgroundColorByHexString('#323232');
          let searchModal = this.modalCtrl.create(Search, { saved_searched_txt: data.search, saveIt: true });
          searchModal.onDidDismiss(data => {
            if (this.WHICH_STREAM == 'me')
              this.statusBar.backgroundColorByHexString('#3bde00');
            else if (this.WHICH_STREAM == 'follows')
              this.statusBar.backgroundColorByHexString('#f4e300');
            else if (this.WHICH_STREAM == 'top')
              this.statusBar.backgroundColorByHexString('#fb9df0');
            if (data.go_to_browser) {
              var anotote = data.anotote;
              if (data.neworold) {
                this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote, FROM: 'search', WHICH_STREAM: 'anon', actual_stream: 'anon' });
              } else
                this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote.userAnnotote, FROM: 'search_result', WHICH_STREAM: 'anon', HIGHLIGHT_RECEIVED: null, actual_stream: anotote.userAnnotote.active_tab });
            }
          });
          searchModal.present();
        } else {
          this.showLoading('Please wait...');
          var params = {
            url: this.get_highlight(element.getAttribute('data-identifier')).tagText,
            created_at: this.utilityMethods.get_php_wala_time(),
            scraped_url: ''
          }
          this.searchService.hypothesis_scrapping(params).subscribe((success) => {
            console.log(success)
            params.scraped_url = success.successMessage;
            this.searchService.create_anotote(params)
              .subscribe((response) => {
                this.hideLoading();
                var bookmark = new SearchUnPinned(0,
                  response.data.annotote.title, params.url,
                  this.authService.getUser().id, 0);
                var temp = this.searchService.getAlreadySavedSearches(bookmark.term)
                if (temp == null)
                  this.searchService.saved_searches.unshift(bookmark);
                else
                  bookmark = temp;

                var paramz = {
                  tags: [response.data],
                  annotote: false,
                  search: bookmark
                }
                let tagsModal = this.modalCtrl.create(TagsPopUp, paramz);
                tagsModal.onDidDismiss((data) => {
                  if (data && data.browseIt) {
                    this.navCtrl.push(AnototeEditor, { ANOTOTE: response.data, FROM: 'search', WHICH_STREAM: 'anon', actual_stream: 'anon' });
                  }
                })
                tagsModal.present();
              }, (error) => {
                this.hideLoading()
              })
          }, (error) => {
            this.hideLoading()
          })
        }
      }
    });
    commentDetailModal.present();
  }

  presentCreateAnotationModal() {
    if (this.selectedText == '') {
      this.selection_lock = false;
      return;
    }
    var opts = {
      cssClass: 'noBackDrop',
      enableBackdropDismiss: true,
      showBackdrop: true
    }
    // this.range = this.sel.getRangeAt(0);
    this.commentDetailModalIsOpen.check = true;
    // if (this.full_screen_mode == false) {
    var temp = window.getSelection();
    this.sel = {
      baseNode: temp.baseNode,
      baseOffset: temp.baseOffset,
      extentNode: temp.extentNode,
      extentOffset: temp.extentOffset
    }
    this.range = document.createRange();
    this.range.setStart(this.selection.startContainer, this.selection.startOffset);
    this.range.setEnd(this.selection.endContainer, this.selection.endOffset);
    // }
    let createAnotationModal = this.modalCtrl.create(CreateAnotationPopup, { selected_txt: this.selectedText, range: this.range, sel: this.sel }, opts);
    createAnotationModal.onDidDismiss(data => {
      if (this.commentDetailModalIsOpen.check == true && this.commentDetailModalIsOpen.comment == null)
        this.commentDetailModalIsOpen.check = false;
      if (data.create) {
        var tags = [];
        if (data.hash.length > 0) {
          for (var i = 0; i < data.hash.length; i++) {
            var tag = {
              text: data.hash[i],
              tag_id: 3,
            }
            tags.push(tag);
          }
        }
        if (data.cash.length > 0) {
          for (var i = 0; i < data.cash.length; i++) {
            var tag = {
              text: data.cash[i],
              tag_id: 4,
            }
            tags.push(tag);
          }
        }
        if (data.uptags.length > 0) {
          for (var i = 0; i < data.uptags.length; i++) {
            var tag = {
              text: data.uptags[i],
              tag_id: 1,
            }
            tags.push(tag);
          }
        }
        if (data.mentions.length > 0) {
          for (var i = 0; i < data.mentions.length; i++) {
            var tag = {
              text: data.mentions[i],
              tag_id: 2,
            }
            tags.push(tag);
          }
        }
        this.create_anotation(data.comment, tags, data.text);
      } else if (data.share) {
        this.utilityMethods.share_content_native('Deep Link', 'Anotote Text Sharing', null, null);
      }
      this.selection_lock = false;
    });
    createAnotationModal.present();
  }

  tagAlreadyExists(identifier, tagText, tagId) {
    if (this.actual_stream != 'me') {
      for (let highlight of this.ANOTOTE.my_highlights) {
        if (highlight.identifier == identifier) {
          for (let tag of highlight.tags) {
            if (tag.tagText == tagText && tag.tagId == tagId) {
              return true;
            }
          }
          return false;
        }
      }
      return false;
    } else {
      for (let highlight of this.ANOTOTE.userAnnotote.annototeHeighlights) {
        if (highlight.identifier == identifier) {
          for (let tag of highlight.tags) {
            if (tag.tagText == tagText && tag.tagId == tagId) {
              return false;
            }
          }
          return true;
        }
      }
      return false;
    }
  }

  saveTags(identifier, tags) {
    var params = {
      tags: tags,
      annotation_id: this.get_highlight(identifier).id,
      user_annotote_id: this.ANOTOTE.userAnnotote.id,
      created_at: this.utilityMethods.get_php_wala_time(),
    }
    // if (this.tags_type == 2)
    //     params['user_id'] = this.one_selected.id;
    this.showLoading('Saving Tags');
    this.searchService.add_tag_to_anotation_all(params).subscribe((result) => {
      this.hideLoading();
      this.get_highlight(identifier).tags = result.data.annotation_tag;
    }, (error) => {
      this.hideLoading();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      } else {
        this.toastInFooter("Couldn't add tag to annotation.");
      }
    })
  }

  /**
   * Create Anotation Comment Type
   */
  private create_anotation(comment, tags, text) {
    if (!comment)
      comment = '';
    this.add_annotation_api('comment', comment, tags, text);
  }

  remove_annotation_api(an_id, element) {
    var current_time = this.utilityMethods.get_php_wala_time();
    element.replaceWith(element.innerText);
    var article_txt = this.get_updated_article_text();
    // var article_txt = document.getElementById('text_editor').innerHTML;
    var tote_id = '';
    if (this.WHICH_STREAM != 'me' && this.WHICH_STREAM != 'anon') {
      tote_id = this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.id : this.ANOTOTE.anototeDetail.meToteFollowTop.id;
    } else {
      if (this.WHICH_STREAM == 'me' || (this.WHICH_STREAM == 'anon' && this.actual_stream == 'anon'))
        tote_id = this.ANOTOTE.userAnnotote.id;
      else
        tote_id = this.ANOTOTE.meToteFollowTop.id;
    }
    this.searchService.remove_anotation({ delete: 1, identifier: an_id, file_text: article_txt, user_annotate_id: tote_id })
      .subscribe((response) => {
        this.hideLoading();
        this.toastInFooter("Annotation removed");
        //not required after HMTheorem
        // if (this.full_screen_mode == false)
        //     this.add_remove_display_none(false).then(() => {
        //         this.for_creating_and_updating_comment = false;
        //     });
        // else {
        //     this.for_creating_and_updating_comment = false;
        //     this.cd.detectChanges();
        // }
        if (this.WHICH_STREAM == 'me') {
          this.runtime.top_first_load = false;
          this.runtime.follow_first_load = false;
          for (var i = 0; i < this.ANOTOTE.userAnnotote.annototeHeighlights.length; i++) {
            if (this.ANOTOTE.userAnnotote.annototeHeighlights[i].id == response.data.annotote.id) {
              this.ANOTOTE.userAnnotote.annototeHeighlights.splice(i, 1);
              break;
            }
          }
          if (this.ANOTOTE.userAnnotote.id == this.ANOTOTE.topUserToteId) {
            this.ANOTOTE.top_highlights = this.ANOTOTE.userAnnotote.annototeHeighlights;
          }
        } else {
          this.runtime.me_first_load = false;
          for (var i = 0; i < this.ANOTOTE.my_highlights.length; i++) {
            if (this.ANOTOTE.my_highlights[i].id == response.data.annotote.id) {
              this.ANOTOTE.my_highlights.splice(i, 1);
              break;
            }
          }
          if (this.WHICH_STREAM == 'follows') {
            this.ANOTOTE.top_highlights = null;
          } else if (this.WHICH_STREAM == 'top') {
            this.runtime.follow_first_load = false;
          } else if (this.WHICH_STREAM == 'anon') {
            this.runtime.me_first_load = false;
            this.runtime.follow_first_load = false;
            this.runtime.top_first_load = false;
          }
        }
      }, (error) => {
        this.utilityMethods.hide_loader();
      });
  }

  update_annotation_api(anotation_id, highlight_text, comment, identifier, element) {
    // this.for_creating_and_updating_comment = true;
    var current_time = this.utilityMethods.get_php_wala_time();
    // element.replaceWith(element.innerText);
    element.className = "highlight_comment"
    element.setAttribute("data-comment", comment);
    var article_txt = this.get_updated_article_text();
    // var article_txt = document.getElementById('text_editor').innerHTML;
    var tote_id = '';
    if (this.WHICH_STREAM != 'me' && this.WHICH_STREAM != 'anon') {
      tote_id = this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.id : this.ANOTOTE.anototeDetail.meToteFollowTop.id;
    } else {
      if (this.WHICH_STREAM == 'me' || (this.WHICH_STREAM == 'anon' && this.actual_stream == 'anon'))
        tote_id = this.ANOTOTE.userAnnotote.id;
      else
        tote_id = this.ANOTOTE.meToteFollowTop.id;
    }
    this.searchService.update_anotation({ highlight_text: highlight_text, identifier: identifier, user_tote_id: tote_id, file_text: article_txt, nodeName: this.nodeName, innerHTML: this.innerHTML, user_annotation_id: anotation_id, comment: comment, updated_at: current_time })
      .subscribe((response) => {
        this.hideLoading();
        //not required after HMTheorem
        // this.toastInFooter("Comment saved");
        // if (this.full_screen_mode == false)
        //     this.add_remove_display_none(false).then(() => {
        //         this.for_creating_and_updating_comment = false;
        //     });
        // else {
        //     this.for_creating_and_updating_comment = false;
        //     this.cd.detectChanges();
        // }
        if (this.WHICH_STREAM == 'me') {
          this.runtime.top_first_load = false;
          this.runtime.follow_first_load = false;
          for (let highlight of this.ANOTOTE.userAnnotote.annototeHeighlights) {
            if (highlight.id == response.data.highlight.id) {
              highlight.comment = response.data.highlight.comment;
              highlight.highlightText = response.data.highlight.highlightText;
              break;
            }
          }
        } else if (this.WHICH_STREAM != 'anon') {
          this.runtime.me_first_load = false;
          for (let highlight of this.ANOTOTE.my_highlights) {
            if (highlight.id == response.data.highlight.id) {
              highlight.comment = response.data.highlight.comment;
              highlight.highlightText = response.data.highlight.highlightText;
              break;
            }
          }
          if (this.WHICH_STREAM == 'follows') {
            this.ANOTOTE.top_highlights = null;
          }
        } else if (this.WHICH_STREAM == 'anon' && this.actual_stream != 'anon') {
          this.runtime.me_first_load = false;
          this.runtime.follow_first_load = false;
          this.runtime.top_first_load = false;
          for (let highlight of this.ANOTOTE.my_highlights) {
            if (highlight.id == response.data.highlight.id) {
              highlight.comment = response.data.highlight.comment;
              highlight.highlightText = response.data.highlight.highlightText;
              break;
            }
          }
        }
      }, (error) => {
        this.utilityMethods.hide_loader();
      });
  }

  add_annotation_api(type, comment, tags, text) {
    // this.events.publish('tote:comment', { selection: this.selection, selected_txt: this.selectedText, type: type });
    var current_time = this.utilityMethods.get_php_wala_time();
    var identifier = this.generate_dynamic_identifier(current_time);
    if (!this.highlight_(type, identifier, comment))
      return;
    // this.for_creating_and_updating_comment = true;
    var article_txt = this.get_updated_article_text();
    // var article_txt = document.getElementById('text_editor').innerHTML;
    var tote_id = '';
    if (this.WHICH_STREAM != 'me' && this.WHICH_STREAM != 'anon') {
      tote_id = this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.id : this.ANOTOTE.anototeDetail.meToteFollowTop.id;
    } else {
      if (this.WHICH_STREAM == 'me' || (this.WHICH_STREAM == 'anon' && this.actual_stream == 'anon'))
        tote_id = this.ANOTOTE.userAnnotote.id;
      else
        tote_id = this.ANOTOTE.meToteFollowTop.id;
    }
    this.searchService.create_anotation({ identifier: identifier, user_tote_id: tote_id, highlight_text: text, nodeName: this.nodeName, innerHTML: this.innerHTML, created_at: current_time, file_text: article_txt, comment: comment })
      .subscribe((response) => {
        this.selectedText = '';
        this.selection_lock = false;
        this.selection = '';
        if (this.actual_stream == 'anon') {
          this.initializeAfterAnon();
        } else {
          this.hideLoading();
          if (this.WHICH_STREAM == 'me') {
            this.runtime.top_first_load = false;
            this.runtime.follow_first_load = false;
            this.ANOTOTE.userAnnotote.annototeHeighlights.push(response.data.annotation);
            if (this.ANOTOTE.userAnnotote.id == this.ANOTOTE.topUserToteId && this.ANOTOTE.top_highlights != null) {
              this.ANOTOTE.top_highlights = this.ANOTOTE.userAnnotote.annototeHeighlights;
            }
          } else if (this.WHICH_STREAM == 'follows' || this.WHICH_STREAM == 'top') {
            this.runtime.me_first_load = false;
            this.ANOTOTE.my_highlights.push(response.data.annotation);
            if (this.WHICH_STREAM == 'follows') {
              this.runtime.top_first_load = false;
              this.ANOTOTE.top_highlights = null;
            } else {
              this.runtime.follow_first_load = false;
            }
          } else if (this.WHICH_STREAM == 'anon' && this.actual_stream != 'anon') {
            this.runtime.me_first_load = false;
            this.runtime.top_first_load = false;
            this.runtime.follow_first_load = false;
            this.ANOTOTE.my_highlights.push(response.data.annotation);
          }
        }
        //not required after HMTheorem
        // if (this.full_screen_mode == false)
        //     this.add_remove_display_none(false).then(() => {
        //         setTimeout(() => {
        //             this.for_creating_and_updating_comment = false;
        //         }, 500);
        //     });
        // else {
        //     this.for_creating_and_updating_comment = false;
        //     this.cd.detectChanges();
        // }
        if (tags.length > 0) {
          var params = {
            tags: tags,
            annotation_id: response.data.annotation.id,
            user_annotote_id: this.ANOTOTE.userAnnotote.id,
            created_at: this.utilityMethods.get_php_wala_time(),
          }
          this.showLoading('Saving Tags');
          this.searchService.add_tag_to_anotation_all(params).subscribe((result) => {
            this.hideLoading();
            response.data.annotation.tags = result.data.annotation_tag;
          }, (error) => {
            this.hideLoading();
            if (error.code == -1) {
              this.utilityMethods.internet_connection_error();
            } else {
              this.toastInFooter("Couldn't add tag to annotation.");
            }
          })
        }
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
        this.selection_lock = false;
      });
  }

  //not required after HMTheorem
  get_updated_article_text(): string {
    // if (this.full_screen_mode == true) {
    //     var iframe: any = document.getElementById('browsed');
    //     // var tag = "<html id='" + (this.WHICH_STREAM == 'top' || this.WHICH_STREAM == 'anon' ? this.ANOTOTE.annotote.htmlId : this.ANOTOTE.userAnnotote.annotote.htmlId) + "' lang='en-US'>"
    //     // return tag + iframe.contentDocument.documentElement.innerHTML + '</html>';
    //     return iframe.contentDocument.documentElement.innerHTML;
    // } else {
    // this.add_remove_display_none(true);
    // var tag = "<html id='" + (this.WHICH_STREAM == 'top' || this.WHICH_STREAM == 'anon' ? this.ANOTOTE.annotote.htmlId : this.ANOTOTE.userAnnotote.annotote.htmlId) + "' lang='en-US'>"
    // return tag + document.getElementById('text_editor').innerHTML + '</html>';
    return document.getElementById('text_editor').innerHTML;
    // }
  }
  // add_remove_display_none(check) {
  //     return new Promise((resolve, reject) => {
  //         var elements = document.querySelectorAll('[data-trick="annotote_trick"]');
  //         for (var i = 0; i < elements.length; i++) {
  //             if (check)
  //                 if (!elements[i].className.includes('popup'))
  //                     elements[i].setAttribute('style', 'display:block');
  //                 else
  //                     elements[i].setAttribute('style', 'display:none');
  //         }
  //         var elements = document.querySelectorAll('[data-header="annotote_trick"]');
  //         for (var i = 0; i < elements.length; i++) {
  //             if (check)
  //                 elements[i].setAttribute('style', 'display:block');
  //             else
  //                 elements[i].setAttribute('style', 'display:none');
  //         }
  //         return resolve();
  //     })

  // }

  showLoading(message) {
    this.loading_message = message;
    this.loading_check = true;
    this.moveFabUp = true;
    this.content.resize();
  }

  hideLoading() {
    this.loading_message = '';
    this.loading_check = false;
    this.moveFabUp = false;
    this.content.resize();
  }

  generate_dynamic_identifier(time) {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + time);
  }

  presentCreateAnotationOptionsModal() {
    let createAnotationOptionsModal = this.modalCtrl.create(CreateAnotationOptionsPopup, { selected_txt: this.selectedText });
    createAnotationOptionsModal.onDidDismiss(data => {
      this.selection_lock = false;
    });
    createAnotationOptionsModal.present();
  }

  upvote(id) {
    this.showLoading('Upvoting')
    var currentHighlight = this.get_highlight(id)
    var params = {
      annotation_id: currentHighlight.id,
      vote: 1,
      created_at: this.utilityMethods.get_php_wala_time()
    }
    this.searchService.vote_anotation(params).subscribe((result) => {
      this.hideLoading();
      this.toastInFooter("Up voted")
      currentHighlight.isCurrentUserVote = 1;
      currentHighlight.currentUserVote = 1;
      currentHighlight.rating = result.data.annotation.rating;
    }, () => {
      this.hideLoading();
      this.toastInFooter("Couldn't upvote")
    });
  }

  downvote(id) {
    this.showLoading("Downvoting")
    var currentHighlight = this.get_highlight(id);
    var params = {
      annotation_id: currentHighlight.id,
      vote: 0,
      identifier: id,
      created_at: this.utilityMethods.get_php_wala_time()
    }
    this.searchService.vote_anotation(params).subscribe((result) => {
      this.hideLoading();
      this.toastInFooter("downvoted");
      currentHighlight.isCurrentUserVote = 1;
      currentHighlight.currentUserVote = 0;
      currentHighlight.rating = result.data.annotation.rating;
    }, () => {
      this.hideLoading();
      this.toastInFooter("Couldn't downvote");
    });
  }

  get_highlight(identifier) {
    if (this.WHICH_STREAM == 'top') {
      if (this.actual_stream == 'top') {
        for (let highlight of this.ANOTOTE.anototeDetail.highlights) {
          if (highlight.identifier == identifier) {
            return highlight;
          }
        }
        return null;
      } else if (this.actual_stream == 'follows') {
        for (let user of this.ANOTOTE.follows) {
          if (user.followTote.filePath == this.ANOTOTE.followerFilePath) {
            for (let highlight of user.highlights) {
              if (highlight.identifier == identifier) {
                return highlight;
              }
            }
          }
        }
        return null;
      } else if (this.actual_stream == 'me') {
        for (let highlight of this.ANOTOTE.my_highlights) {
          if (highlight.identifier == identifier) {
            return highlight;
          }
        }
        return null;
      }
    } else if (this.WHICH_STREAM == 'anon') {
      if (this.actual_stream == 'follows') {
        for (let user of this.ANOTOTE.followers) {
          if (user.followTote.filePath == this.ANOTOTE.followerFilePath) {
            for (let highlight of user.highlights) {
              if (highlight.identifier == identifier) {
                return highlight;
              }
            }
          }
        }
        return null;
      } else if (this.actual_stream == 'top') {
        for (let highlight of this.ANOTOTE.top_highlights) {
          if (highlight.identifier == identifier) {
            return highlight;
          }
        }
        return null;
      } else if (this.actual_stream == 'me') {
        for (let highlight of this.ANOTOTE.my_highlights) {
          if (highlight.identifier == identifier) {
            return highlight;
          }
        }
        return null;
      }
    } else {
      if (this.actual_stream == 'me') {
        if (this.WHICH_STREAM == 'me') {
          for (let highlight of this.ANOTOTE.userAnnotote.annototeHeighlights) {
            if (highlight.identifier == identifier) {
              return highlight;
            }
          }
          return null;
        } else {
          for (let highlight of this.ANOTOTE.my_highlights) {
            if (highlight.identifier == identifier) {
              return highlight;
            }
          }
          return null;
        }
      } else if (this.actual_stream == 'follows') {
        for (let user of this.ANOTOTE.followers) {
          if (user.followTote.filePath == this.ANOTOTE.followerFilePath) {
            for (let highlight of user.highlights) {
              if (highlight.identifier == identifier) {
                return highlight;
              }
            }
          }
        }
        return null;
      } else if (this.actual_stream == 'top') {
        for (let highlight of this.ANOTOTE.top_highlights) {
          if (highlight.identifier == identifier) {
            return highlight;
          }
        }
        return null;
      }

    }
  }

  show_annotation_tags(id) {
    var params = {
      annotation_id: this.get_highlight(id).id,
      user_annotote_id: this.ANOTOTE.userAnnotote.id,
      tags: this.get_highlight(id).tags,
      whichStream: this.actual_stream,
      annotote: false
    }
    let tagsModal = this.modalCtrl.create(TagsPopUp, params);
    tagsModal.present();
  }

  presentViewOptionsModal() {
    var params = {
      anotote: (this.WHICH_STREAM == 'anon' && this.FROM != 'search_result') ? this.ANOTOTE.userAnnotote : this.ANOTOTE,
      stream: this.FROM == 'search_result' ? 'follows' : this.WHICH_STREAM
    }
    let viewsOptionsModal = this.modalCtrl.create(ViewOptions, params);
    viewsOptionsModal.onDidDismiss((preference) => {
      if (preference.tab_selected == 'me')
        this.showMeHighlights(this.ANOTOTE);
      else if (preference.tab_selected == 'follows' && this.WHICH_STREAM != 'top' && this.WHICH_STREAM != 'anon')
        this.open_follows_popup(event, this.ANOTOTE);
      else if (preference.tab_selected == 'follows' && (this.WHICH_STREAM == 'top' || this.WHICH_STREAM == 'anon')) {
        if (this.WHICH_STREAM == 'anon' && this.FROM == 'search')
          this.top_follows_popup(event, this.ANOTOTE.userAnnotote);
        else if (this.WHICH_STREAM == 'anon' && this.FROM == 'search_result')
          this.open_follows_popup(event, this.ANOTOTE);
        else
          this.top_follows_popup(event, this.ANOTOTE);
      } else if (preference.tab_selected == 'top')
        this.show_top_tab(this.ANOTOTE);
    })
    viewsOptionsModal.present();
  }

  showMeHighlights(anotote) {
    this.content.scrollToTop();
    if (this.WHICH_STREAM == 'me') {
      anotote.highlights = Object.assign(anotote.userAnnotote.annototeHeighlights);
      anotote.meFilePath = anotote.userAnnotote.filePath;
      anotote.active_tab = 'me';
      this.title_temp = Object.assign(this.ANOTOTE.userAnnotote.anototeDetail.userAnnotote.annototeTitle);
      this.actual_stream = anotote.active_tab;
      this.scrape_anotote(anotote.meFilePath);
    } else if (this.WHICH_STREAM == 'follows' || this.WHICH_STREAM == 'top' || this.WHICH_STREAM == 'anon') {
      if (this.WHICH_STREAM == 'top' && anotote.anototeDetail.meToteFollowTop && anotote.anototeDetail.meToteFollowTop.id == anotote.userAnnotote.id) {
        anotote.my_highlights = anotote.top_highlights;
        anotote.highlights = Object.assign(anotote.my_highlights);
        anotote.active_tab = 'me';
        anotote.meFilePath = anotote.anototeDetail.userAnnotote.filePath;
        this.title_temp = Object.assign(anotote.anototeDetail.meToteFollowTop.annototeTitle);
        this.actual_stream = anotote.active_tab;
        this.scrape_anotote(anotote.meFilePath);
      } else if (anotote.my_highlights == undefined) {
        this.showLoading('Loading annotote')
        var params = {
          user_id: this.user.id,
          anotote_id: this.WHICH_STREAM == 'follows' ? anotote.userAnnotote.anototeDetail.meToteFollowTop.id : (this.WHICH_STREAM == 'top' ? anotote.anototeDetail.meToteFollowTop.id : anotote.meToteFollowTop.id),
          time: this.utilityMethods.get_php_wala_time()
        }
        this.anotote_service.fetchToteDetails(params).subscribe((result) => {
          this.hideLoading();
          if (result.status == 1) {
            anotote.active_tab = 'me'
            anotote.highlights = Object.assign(result.data.annotote.highlights);
            anotote.my_highlights = result.data.annotote.highlights;
            this.title_temp = result.data.annotote.annotote.title;
            anotote.meFilePath = result.data.annotote.userAnnotote.filePath;
            this.actual_stream = anotote.active_tab;
            this.scrape_anotote(anotote.meFilePath);
          } else {
            this.toastInFooter("Couldn't fetch annotations");
            anotote.active = false;
          }
        }, (error) => {
          this.hideLoading();
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          }
        });
      } else {
        if (this.WHICH_STREAM == 'follows' || this.WHICH_STREAM == 'anon')
          this.title_temp = Object.assign(anotote.userAnnotote.anototeDetail.meToteFollowTop.annototeTitle);
        else if (this.WHICH_STREAM == 'top')
          this.title_temp = Object.assign(anotote.anototeDetail.meToteFollowTop.annototeTitle);
        else
          this.title_temp = Object.assign(this.ANOTOTE.userAnnotote.anototeDetail.userAnnotote.annototeTitle);
        anotote.active_tab = 'me';
        anotote.highlights = Object.assign(anotote.my_highlights);
        this.actual_stream = anotote.active_tab;
        this.scrape_anotote(anotote.meFilePath);
      }
    }
    //  else if (this.WHICH_STREAM == 'anon' && (this.FROM == 'search_result' || this.FROM == 'search')) {
    //     anotote.active_tab = 'me';
    //     anotote.highlights = Object.assign(anotote.userAnnotote.highlights);
    //     this.actual_stream = anotote.active_tab;
    //     this.scrape_anotote(anotote.meFilePath);
    // }
  }

  follows_tab_from_footer(which) {
    if (which == 'open_follows_popup')
      this.open_follows_popup(null, this.ANOTOTE);
    else if (which == 'top_follows_popup')
      this.top_follows_popup(null, this.ANOTOTE);
  }

  show_top_tab(anotote) {
    this.content.scrollToTop();
    setTimeout(() => {
      this.content.resize();
    }, 500);
    if (this.WHICH_STREAM != 'anon' || this.FROM == 'search' || this.FROM == 'search_result') {
      if (anotote.top_highlights == undefined) {
        if (anotote.userAnnotote.id != anotote.topUserToteId) {
          this.showLoading("Loading annotote");
          var params = {
            user_id: this.user.id,
            anotote_id: anotote.topUserToteId,
            time: this.utilityMethods.get_php_wala_time()
          }
          this.anotote_service.fetchToteDetails(params).subscribe((result) => {
            this.hideLoading();
            anotote.active_tab = 'top'
            anotote.topFilePath = result.data.annotote.userAnnotote.filePath;
            anotote.top_tags = result.data.annotote.userAnnotote.tags;
            this.actual_stream = anotote.active_tab;
            this.scrape_anotote(anotote.topFilePath);
            anotote.topVote = {
              currentUserVote: result.data.annotote.userAnnotote.currentUserVote,
              rating: result.data.annotote.userAnnotote.rating,
              isCurrentUserVote: result.data.annotote.userAnnotote.isCurrentUserVote
            }
            if (result.status == 1) {
              anotote.highlights = Object.assign(result.data.annotote.highlights);
              anotote.top_highlights = result.data.annotote.highlights;
            } else {
              this.toastInFooter("Could not fetch top data");
            }
          }, (error) => {
            this.hideLoading();
            if (error.code == -1) {
              this.utilityMethods.internet_connection_error();
            }
          })
        } else {
          if (this.FROM == 'search' || this.FROM == 'search_result') {
            anotote.top_highlights = anotote.userAnnotote.highlights;
            anotote.active_tab = 'top';
            anotote.topFilePath = anotote.userAnnotote.filePath;
            anotote.top_tags = anotote.userAnnotote.tags;
            this.actual_stream = anotote.active_tab;
            this.scrape_anotote(anotote.topFilePath);
          } else {
            anotote.top_highlights = anotote.userAnnotote.annototeHeighlights;
            anotote.active_tab = 'top';
            anotote.topFilePath = anotote.userAnnotote.filePath;
            anotote.top_tags = anotote.userAnnotote.anototeDetail.userAnnotote.tags
            this.actual_stream = anotote.active_tab;
            anotote.topVote = {
              currentUserVote: anotote.userAnnotote.anototeDetail.userAnnotote.currentUserVote,
              rating: anotote.userAnnotote.anototeDetail.userAnnotote.rating,
              isCurrentUserVote: anotote.userAnnotote.anototeDetail.userAnnotote.isCurrentUserVote
            }
            this.scrape_anotote(anotote.topFilePath);
          }
        }
      } else {
        anotote.active_tab = 'top'
        anotote.highlights = Object.assign(anotote.top_highlights);
        this.actual_stream = anotote.active_tab;
        this.scrape_anotote(anotote.topFilePath);
      }
    } else {
      if (anotote.top_highlights == undefined) {
        this.showLoading('Loading annotote')
        var params = {
          user_id: this.user.id,
          anotote_id: anotote.userAnnotote.topUserToteId,
          time: this.utilityMethods.get_php_wala_time()
        }
        this.anotote_service.fetchToteDetails(params).subscribe((result) => {
          this.hideLoading();
          anotote.active_tab = 'top'
          this.ANOTOTE.userAnnotote.active_tab = 'top';
          anotote.userAnnotote.top_tags = result.data.annotote.userAnnotote.tags;
          anotote.topFilePath = result.data.annotote.userAnnotote.filePath;
          this.actual_stream = anotote.active_tab;
          anotote.topVote = {
            currentUserVote: result.data.annotote.userAnnotote.currentUserVote,
            rating: result.data.annotote.userAnnotote.rating,
            isCurrentUserVote: result.data.annotote.userAnnotote.isCurrentUserVote
          }
          this.scrape_anotote(anotote.topFilePath);
          if (result.status == 1) {
            anotote.highlights = Object.assign(result.data.annotote.highlights);
            anotote.top_highlights = result.data.annotote.highlights;
          } else {
            this.toastInFooter("Could not fetch top data");
          }
        }, (error) => {
          this.hideLoading();
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          }
        })
      } else {
        anotote.highlights = Object.assign(anotote.top_highlights);
        anotote.active_tab = 'top';
        this.ANOTOTE.userAnnotote.active_tab = 'top';
        this.actual_stream = anotote.active_tab;
        this.scrape_anotote(anotote.topFilePath);
      }
    }
  }

  open_follows_popup(event, anotote) {
    if (event)
      event.stopPropagation();
    setTimeout(() => {
      this.content.resize();
    }, 500);
    if (anotote.followers.length == 1) {
      anotote.selected_follower_name = anotote.followers[0].firstName;
      anotote.active_tab = 'follows';
      anotote.followerFilePath = anotote.followers[0].followTote.filePath;
      anotote.follower_tags = anotote.followers[0].followTote.tags;
      this.follow_visited = true;
      this.loadFollower(anotote, anotote.followers[0])
    } else if (anotote.followers.length > 1) {
      if (this.follow_visited) {
        let anototeOptionsModal = this.modalCtrl.create(FollowsPopup, { follows: anotote.followers });
        anototeOptionsModal.onDidDismiss(data => {
          if (data != null) {
            anotote.selected_follower_name = data.user.firstName;
            anotote.active_tab = 'follows'
            anotote.followerFilePath = data.user.followTote.filePath;
            anotote.follower_tags = data.user.followTote.tags;
            this.loadFollower(anotote, data.user);
          }
        });
        anototeOptionsModal.present();
      } else {
        anotote.selected_follower_name = anotote.followers[0].firstName;
        anotote.active_tab = 'follows';
        this.follow_visited = true;
        anotote.followerFilePath = anotote.followers[0].followTote.filePath;
        anotote.follower_tags = anotote.followers[0].followTote.tags;
        this.loadFollower(anotote, anotote.followers[0])
      }
    } else {
      this.toastInFooter('No one follows this anotote.');
    }

  }

  loadFollower(anotote, user) {
    if (user.highlights == null) {
      this.showLoading('Loading annotote')
      var params = {
        user_id: user.id,
        anotote_id: user.followTote.id,
        time: this.utilityMethods.get_php_wala_time()
      }
      this.anotote_service.fetchToteDetails(params).subscribe((result) => {
        this.hideLoading();
        user.highlights = result.data.annotote.highlights;
        anotote.highlights = Object.assign(result.data.annotote.highlights);
        this.actual_stream = anotote.active_tab;
        this.scrape_anotote(anotote.followerFilePath);
      }, (error) => {
        this.hideLoading();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
    } else {
      anotote.highlights = Object.assign(user.highlights);
      this.actual_stream = anotote.active_tab;
      this.scrape_anotote(anotote.followerFilePath);
    }
  }

  top_follows_popup(event, anotote) {
    if (event)
      event.stopPropagation();
    setTimeout(() => {
      this.content.resize();
    }, 500);
    if (anotote.follows.length == 1) {
      anotote.selected_follower_name = anotote.follows[0].firstName;
      anotote.active_tab = 'follows';
      this.actual_stream = anotote.active_tab;
      anotote.followerFilePath = anotote.follows[0].followTote.filePath;
      if (this.WHICH_STREAM == 'anon') {
        this.ANOTOTE.selected_follower_name = anotote.selected_follower_name;
        this.ANOTOTE.active_tab = 'follows';
        this.ANOTOTE.followers = anotote.follows;
        this.ANOTOTE.followerFilePath = anotote.followerFilePath;
      }
      anotote.follower_tags = anotote.follows[0].followTote.tags;
      this.loadFollower(anotote, anotote.follows[0])
    } else if (anotote.follows.length > 1) {
      if (this.follow_visited) {
        let anototeOptionsModal = this.modalCtrl.create(FollowsPopup, { follows: anotote.follows });
        anototeOptionsModal.onDidDismiss(data => {
          if (data != null) {
            anotote.selected_follower_name = data.user.firstName;
            anotote.active_tab = 'follows'
            this.actual_stream = anotote.active_tab;
            anotote.followerFilePath = data.user.followTote.filePath;
            if (this.WHICH_STREAM == 'anon') {
              this.ANOTOTE.selected_follower_name = anotote.selected_follower_name;
              this.ANOTOTE.active_tab = 'follows';
              this.ANOTOTE.followers = anotote.follows;
              this.ANOTOTE.followerFilePath = anotote.followerFilePath;
            }
            anotote.follower_tags = data.user.followTote.tags;
            this.loadFollower(anotote, data.user);
          }
        });
        anototeOptionsModal.present();
      } else {
        this.follow_visited = true;
        anotote.selected_follower_name = anotote.follows[0].firstName;
        anotote.active_tab = 'follows';
        if (this.WHICH_STREAM == 'anon') {
          this.ANOTOTE.active_tab = 'follows'
          this.ANOTOTE.followers = anotote.follows;
        }
        anotote.followerFilePath = anotote.follows[0].followTote.filePath;
        anotote.follower_tags = anotote.follows[0].followTote.tags;
        this.loadFollower(anotote, anotote.follows[0])
      }
    } else {
      this.toastInFooter('No one follows this anotote.');
    }

  }

  toastInFooter(message) {
    this.showLoading(message);
    this.content.resize();
    setTimeout(() => {
      this.hideLoading();
    }, 2000);
  }

  toteOptions() {
    var params = {
      anotote: this.FROM == 'search' ? this.ANOTOTE.userAnnotote : this.ANOTOTE,
      whichStream: this.FROM == 'search_result' ? 'search' : this.WHICH_STREAM,
      active_tab: this.actual_stream
    }
    let anototeOptionsModal = this.modalCtrl.create(AnototeOptions, params);
    anototeOptionsModal.onDidDismiss(data => {
      if (data.tags) {
        if (this.WHICH_STREAM != 'top') {
          if (this.WHICH_STREAM == 'me' && (this.ANOTOTE.active_tab == 'me' || this.ANOTOTE.active_tab == undefined))
            var params: any = {
              user_tote_id: this.ANOTOTE.userAnnotote.id,
              tags: this.ANOTOTE.userAnnotote.anototeDetail.userAnnotote.tags,
              whichStream: 'me',
              annotote: true
            }
          else if (this.WHICH_STREAM == 'follows' && this.ANOTOTE.active_tab == 'me')
            var params: any = {
              user_tote_id: this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.id,
              tags: this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.tags,
              whichStream: 'me',
              annotote: true
            }
          else if (this.ANOTOTE.active_tab == 'follows' || (this.WHICH_STREAM == 'follows' && this.ANOTOTE.active_tab == undefined))
            var params: any = {
              user_tote_id: this.ANOTOTE.userAnnotote.id,
              tags: this.ANOTOTE.follower_tags,
              whichStream: 'follows',
              annotote: true
            }
          else if (this.ANOTOTE.active_tab == 'top')
            var params: any = {
              user_tote_id: this.ANOTOTE.userAnnotote.id,
              tags: this.ANOTOTE.top_tags,
              whichStream: 'top',
              annotote: true
            }
          else if (this.WHICH_STREAM == 'anon' && this.FROM == 'search_result')
            var params: any = {
              user_tote_id: (this.ANOTOTE.active_tab == 'me' || this.ANOTOTE.active_tab == 'follows') == true ? this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.id : this.ANOTOTE.topUserToteId,
              tags: (this.ANOTOTE.active_tab == 'me' || this.ANOTOTE.active_tab == 'follows') == true ? this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.tags : this.ANOTOTE.top_tags,
              whichStream: this.ANOTOTE.active_tab,
              annotote: true
            }

          let tagsModal = this.modalCtrl.create(TagsPopUp, params);
          tagsModal.present();
        } else if (this.WHICH_STREAM == 'top') {
          if (this.ANOTOTE.active_tab == 'me') {
            var params: any = {
              user_tote_id: this.ANOTOTE.anototeDetail.meToteFollowTop.id,
              tags: this.ANOTOTE.anototeDetail.meToteFollowTop.tags,
              whichStream: 'me',
              annotote: true
            }
          } else if (this.ANOTOTE.active_tab == 'follows') {
            var params: any = {
              user_tote_id: this.ANOTOTE.userAnnotote.id,
              tags: this.ANOTOTE.follower_tags,
              whichStream: 'follows',
              annotote: true
            }
          } else if (this.ANOTOTE.active_tab == 'top' || this.ANOTOTE.active_tab == undefined) {
            var params: any = {
              user_tote_id: this.ANOTOTE.userAnnotote.id,
              tags: this.ANOTOTE.anototeDetail.userAnnotote.tags,
              whichStream: 'top',
              annotote: true
            }
          }
          let tagsModal = this.modalCtrl.create(TagsPopUp, params);
          tagsModal.present();
        }
      } else if (data.delete == true) {
        if (this.WHICH_STREAM == 'me') {
          this.runtime.top_first_load = false;
          this.runtime.follow_first_load = false;
          this.runtime.me_anototes.splice(this.runtime.me_anototes.indexOf(this.ANOTOTE), 1)
          this.navCtrl.pop();
        } else {
          this.ANOTOTE.isMe = 0;
          if (this.WHICH_STREAM == 'follows') {
            this.ANOTOTE.userAnnotote.anototeDetail.isMe = 0;
            this.runtime.me_first_load = false;
            this.runtime.top_first_load = false;
            this.follow_visited = false;
            this.open_follows_popup(null, this.ANOTOTE);
          } else if (this.WHICH_STREAM == 'top') {
            this.ANOTOTE.anototeDetail.isMe = 0;
            this.runtime.me_first_load = false;
            this.runtime.follow_first_load = false;
            this.show_top_tab(this.ANOTOTE);
          } else if (this.WHICH_STREAM == 'anon') {
            this.ANOTOTE.isMe = 0;
            this.runtime.top_first_load = false;
            this.runtime.me_first_load = false;
            this.runtime.follow_first_load = false;
            if (this.ANOTOTE.isTop == 0 && this.ANOTOTE.follows.length == 0) {
              this.navCtrl.pop();
            } else if (this.ANOTOTE.isTop == 1) {
              this.show_top_tab(this.ANOTOTE);
            } else if (this.ANOTOTE.follows.length > 0) {
              this.top_follows_popup(null, this.ANOTOTE);
            }
          }
        }
      } else if (data.chat) {
        var chatParams = {
          anotote: this.ANOTOTE,
          stream: this.WHICH_STREAM,
          findChatter: true,
          doChat: true
        }
        let chatTote = this.modalCtrl.create(ChatToteOptions, chatParams);
        chatTote.onDidDismiss((data) => {
          if (data.chat) {
            this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: true, anotote_id: this.ANOTOTE.userAnnotote.annototeId, title: data.title, full_tote: this.ANOTOTE });
          }
        })
        chatTote.present();
      }
    });
    anototeOptionsModal.present();
  }

  voteLoadingEvents(message) {
    if (message == 'TOAST')
      this.toastInFooter("Couldn't update vote, Please try again later.");
    else if (message != '')
      this.showLoading(message)
    else
      this.hideLoading();
  }

  upvote_anotote() {
    if (this.WHICH_STREAM != 'top') {
      if (this.ANOTOTE.active_tab == 'top') {
        this.showLoading('Upvoting');
        var params = {
          user_tote_id: this.ANOTOTE.topUserToteId,
          vote: 1,
          created_at: this.utilityMethods.get_php_wala_time()
        }
        this.anotote_service.vote_anotote(params).subscribe((success) => {
          this.hideLoading();
          this.ANOTOTE.topVote.currentUserVote = success.data.annotote.currentUserVote;
          this.ANOTOTE.topVote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
          this.ANOTOTE.topVote.rating = success.data.annotote.rating;
        }, (error) => {
          this.hideLoading();
          this.toastInFooter("Couldn't upvote");
        })
      } else if (this.ANOTOTE.active_tab == 'follows') {
        this.showLoading('Upvoting');
        var follower = this.selectedFollowerToteId();
        var params = {
          user_tote_id: follower.followTote.id,
          vote: 1,
          created_at: this.utilityMethods.get_php_wala_time()
        }
        this.anotote_service.vote_anotote(params).subscribe((success) => {
          this.hideLoading();
          follower.followTote.currentUserVote = success.data.annotote.currentUserVote;
          follower.followTote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
          follower.followTote.rating = success.data.annotote.rating;
        }, (error) => {
          this.hideLoading();
          this.toastInFooter("Couldn't upvote");
        })
      }
    } else {
      if (this.ANOTOTE.active_tab == 'top') {
        this.showLoading('Upvoting');
        var params = {
          user_tote_id: this.ANOTOTE.anototeDetail.userAnnotote.id,
          vote: 1,
          created_at: this.utilityMethods.get_php_wala_time()
        }
        this.anotote_service.vote_anotote(params).subscribe((success) => {
          this.hideLoading();
          this.ANOTOTE.anototeDetail.userAnnotote.currentUserVote = success.data.annotote.currentUserVote;
          this.ANOTOTE.anototeDetail.userAnnotote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
          this.ANOTOTE.anototeDetail.userAnnotote.rating = success.data.annotote.rating;
          this.ANOTOTE.userAnnotote.currentUserVote = success.data.annotote.currentUserVote;
          this.ANOTOTE.userAnnotote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
          this.ANOTOTE.userAnnotote.rating = success.data.annotote.rating;
        }, (error) => {
          this.hideLoading();
          this.toastInFooter("Couldn't upvote");
        })
      } else if (this.ANOTOTE.active_tab == 'follows') {
        this.showLoading('Upvoting');
        var follower = this.selectedFollowerTopPage();
        var params = {
          user_tote_id: follower.followTote.id,
          vote: 1,
          created_at: this.utilityMethods.get_php_wala_time()
        }
        this.anotote_service.vote_anotote(params).subscribe((success) => {
          this.hideLoading();
          follower.followTote.currentUserVote = success.data.annotote.currentUserVote;
          follower.followTote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
          follower.followTote.rating = success.data.annotote.rating;
        }, (error) => {
          this.hideLoading();
          this.toastInFooter("Couldn't upvote");
        })
      }
    }

  }

  downvote_anotote() {
    if (this.WHICH_STREAM != 'top') {
      if (this.ANOTOTE.active_tab == 'top') {
        this.showLoading('Downvoting');
        var params = {
          user_tote_id: this.ANOTOTE.topUserToteId,
          vote: 0,
          created_at: this.utilityMethods.get_php_wala_time()
        }
        this.anotote_service.vote_anotote(params).subscribe((success) => {
          this.hideLoading();
          this.ANOTOTE.topVote.currentUserVote = success.data.annotote.currentUserVote;
          this.ANOTOTE.topVote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
          this.ANOTOTE.topVote.rating = success.data.annotote.rating;
        }, (error) => {
          this.hideLoading();
          this.toastInFooter("Couldn't downvote");
        })
      } else if (this.ANOTOTE.active_tab == 'follows') {
        this.showLoading('Downvoting');
        var follower = this.selectedFollowerToteId();
        var params = {
          user_tote_id: follower.followTote.id,
          vote: 0,
          created_at: this.utilityMethods.get_php_wala_time()
        }
        this.anotote_service.vote_anotote(params).subscribe((success) => {
          this.hideLoading();
          follower.followTote.currentUserVote = success.data.annotote.currentUserVote;
          follower.followTote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
          follower.followTote.rating = success.data.annotote.rating;
        }, (error) => {
          this.hideLoading();
          this.toastInFooter("Couldn't downvote");
        })
      }
    } else {
      if (this.ANOTOTE.active_tab == 'top') {
        this.showLoading('Downvoting');
        var params = {
          user_tote_id: this.ANOTOTE.anototeDetail.userAnnotote.id,
          vote: 0,
          created_at: this.utilityMethods.get_php_wala_time()
        }
        this.anotote_service.vote_anotote(params).subscribe((success) => {
          this.hideLoading();
          this.ANOTOTE.anototeDetail.userAnnotote.currentUserVote = success.data.annotote.currentUserVote;
          this.ANOTOTE.anototeDetail.userAnnotote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
          this.ANOTOTE.anototeDetail.userAnnotote.rating = success.data.annotote.rating;
        }, (error) => {
          this.hideLoading();
          this.toastInFooter("Couldn't downvote");
        })
      } else if (this.ANOTOTE.active_tab == 'follows') {
        this.showLoading('Downvoting');
        var follower = this.selectedFollowerTopPage();
        var params = {
          user_tote_id: follower.followTote.id,
          vote: 0,
          created_at: this.utilityMethods.get_php_wala_time()
        }
        this.anotote_service.vote_anotote(params).subscribe((success) => {
          this.hideLoading();
          follower.followTote.currentUserVote = success.data.annotote.currentUserVote;
          follower.followTote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
          follower.followTote.rating = success.data.annotote.rating;
        }, (error) => {
          this.hideLoading();
          this.toastInFooter("Couldn't downvote");
        })
      }
    }
  }

  selectedFollowerToteId() {
    for (let follower of this.ANOTOTE.followers) {
      if (follower.firstName == this.ANOTOTE.selected_follower_name) {
        return follower;
      }
    }
    return null;
  }

  selectedFollowerTopPage() {
    for (let follower of this.ANOTOTE.anototeDetail.follows) {
      if (follower.firstName == this.ANOTOTE.selected_follower_name) {
        return follower;
      }
    }
    return null;
  }

}
