import { Component, ElementRef, Input, Pipe, ViewChild, Output, Directive, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, Events, Content, NavParams, ModalController } from 'ionic-angular';
import { CommentDetailPopup } from '../anotote-editor/comment_detail_popup';
import { CreateAnotationPopup } from '../anotote-editor/create_anotation';
import { CreateAnotationOptionsPopup } from '../anotote-editor/create_anotation_options';
import { TextEditor } from '../directives/editor';
import { Search } from '../search/search';
import { SocialSharing } from '@ionic-native/social-sharing';
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

@IonicPage()
@Component({
    selector: 'page-anotote-editor',
    templateUrl: 'anotote-editor.html',
    styles: [
        ':host /deep/ >>> .highlight_quote, .highlight_comment { background: #f5f6f7;color: red; };.highlight_quote:before { content: "*";width: 25px;height: 25px;display: inline-block;text-align: center;background: greenyellow; };'
    ]
})
export class AnototeEditor implements OnDestroy {
    @ViewChild(Content) content: Content;
    /**
     * Reg Scroll Hide/Show Header
     */
    private ANOTOTE: any;
    private WHICH_STREAM: string;
    private FROM: string;
    private HIGHLIGHT_RECEIVED: any;
    private ANOTOTE_LOADED: boolean;
    private ANOTOTE_LOADING_ERROR: boolean;
    private SAVED_ANOTOTES_LOCALLY: any;
    private SAVED_ANOTOTES_LOCALLY_CURRENT: any;

    public start = 0;
    public threshold = 100;
    public slideHeaderPrevious = 0;
    public ionScroll: any;
    public showheader: boolean;
    public hideheader: boolean;
    public tote_saved: boolean;
    public headercontent: any;
    public toggle_annotation_option: boolean;
    public htmlStr: string = '<strong>The Tortoise</strong> &amp; the Hare';
    private selectedText: string;
    private selection: any;
    private highlight: any;
    private selected_highlight: { txt: '', identifier: '', type: '', comment: '', from_where: '' };
    private selection_lock: boolean;
    private text: string; // Anotote article whole text
    private tote_id: string;
    private main_anotote_id: string;
    private tote_user_id: string;
    private from_where: string;
    private full_screen_mode: boolean;
    private detail_event: any;
    private which_stream: string;
    private sel: any;
    private range: any;
    private actual_stream: string;
    private search_obj_to_be_deleted;
    public user: User;
    public moveFabUp: boolean = false;
    public follow_visited = false;

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
        public runtime: Streams,
        public cd: ChangeDetectorRef) {

        var that = this;
        this.toggle_annotation_option = false;
        this.selection_lock = false;
        this.user = authService.getUser();

        /**
         * Assigning Values
         */
        var anotote_from_params = {
            ANOTOTE: navParams.get('ANOTOTE'),
            FROM: navParams.get('FROM'),
            WHICH_STREAM: navParams.get('WHICH_STREAM'),
            HIGHLIGHT_RECEIVED: navParams.get('HIGHLIGHT_RECEIVED'),
            actual_stream: navParams.get('actual_stream')
        };
        if (anotote_from_params.actual_stream == 'anon') {
            this.search_obj_to_be_deleted = navParams.get('search_to_delete');
        }
        this.anotote_service.add_page_locally(anotote_from_params);
        this.SAVED_ANOTOTES_LOCALLY = this.anotote_service.get_saved_pages_locally();
        this.SAVED_ANOTOTES_LOCALLY_CURRENT = this.SAVED_ANOTOTES_LOCALLY.length - 1;

        this.load_new_anotote(anotote_from_params, true);

        /**
         * Document Selection Listner
         */
        document.addEventListener("selectionchange", function () {
            var sel = getSelection(),
                selected_txt = sel.toString();
            if (selected_txt != '') {
                var range = sel.getRangeAt(0);
                var current_selection = { "startContainer": range.startContainer, "startOffset": range.startOffset, "endContainer": range.endContainer, "endOffset": range.endOffset };
                events.publish('show_tote_options', { flag: true, txt: selected_txt, selection: current_selection });
            } else {
                events.publish('show_tote_options', { flag: false, txt: '', selection: '' });
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

    load_previous_page() {
        if (this.SAVED_ANOTOTES_LOCALLY.length > 1 && this.SAVED_ANOTOTES_LOCALLY_CURRENT > 0) {
            this.SAVED_ANOTOTES_LOCALLY_CURRENT--;
            this.load_new_anotote(this.SAVED_ANOTOTES_LOCALLY[this.SAVED_ANOTOTES_LOCALLY_CURRENT], false);
        }
    }

    load_next_page() {
        if (this.SAVED_ANOTOTES_LOCALLY.length > 1 && this.SAVED_ANOTOTES_LOCALLY_CURRENT < this.SAVED_ANOTOTES_LOCALLY.length - 1) {
            this.SAVED_ANOTOTES_LOCALLY_CURRENT++;
            this.load_new_anotote(this.SAVED_ANOTOTES_LOCALLY[this.SAVED_ANOTOTES_LOCALLY_CURRENT], false);
        }
    }

    load_new_anotote(ANOTOTE_OBJECT, move_to_highlight_flag?) {
        this.utilityMethods.show_loader('');
        this.ANOTOTE = ANOTOTE_OBJECT.ANOTOTE;
        this.FROM = ANOTOTE_OBJECT.FROM;
        this.WHICH_STREAM = ANOTOTE_OBJECT.WHICH_STREAM
        this.which_stream = this.WHICH_STREAM;
        this.HIGHLIGHT_RECEIVED = ANOTOTE_OBJECT.HIGHLIGHT_RECEIVED;
        this.actual_stream = ANOTOTE_OBJECT.actual_stream;
        // if (move_to_highlight_flag)
        //     this.HIGHLIGHT_RECEIVED = ANOTOTE_OBJECT.HIGHLIGHT_RECEIVED;
        // else
        //     this.HIGHLIGHT_RECEIVED = null;

        this.ANOTOTE_LOADED = false;
        this.ANOTOTE_LOADING_ERROR = false;
        this.tote_id = this.ANOTOTE.userAnnotote.id;
        this.main_anotote_id = this.ANOTOTE.userAnnotote.annototeId;
        this.tote_user_id = this.ANOTOTE.userAnnotote.userId;
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
            this.scrape_anotote(this.ANOTOTE.userAnnotote.filePath);
        }
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
            } else {
                this.showheader = false;
                this.hideheader = true;
            }
            if (this.slideHeaderPrevious >= this.ionScroll.scrollTop - this.start) {
                this.showheader = false;
                this.hideheader = true;
            }
            this.slideHeaderPrevious = this.ionScroll.scrollTop - this.start;
        });
    }

    /**
     * Page LifeCycle Events
     */
    ionViewDidLoad() {
        if (this.navParams.get('WHICH_STREAM') == 'me')
            this.statusBar.backgroundColorByHexString('#3bde00');
        else if (this.navParams.get('WHICH_STREAM') == 'follows')
            this.statusBar.backgroundColorByHexString('#f4e300');
        else
            this.statusBar.backgroundColorByHexString('#fb9df0');
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
                }
                this.content.resize();
                // this.cd.detectChanges();
            }
        });
        this.events.subscribe('show_anotation_details', (data) => {
            this.presentCommentDetailModal(data.txt);
        });
    }

    ionViewDidLeave() {
    }


    ngOnDestroy() {
        this.events.unsubscribe('show_anotation_details');
        this.events.unsubscribe('show_tote_options');
    }

    /**
     * Scrap anotote
     */
    scrape_anotote(file_path) {
        this.searchService.get_anotote_content(file_path)
            .subscribe((response_content) => {
                this.utilityMethods.hide_loader();
                this.text = response_content.text();
                var that = this;
                if (this.from_where == 'anotote_list' && this.HIGHLIGHT_RECEIVED != null)
                    setTimeout(function () {
                        that.scrollTo(that.HIGHLIGHT_RECEIVED.identifier);
                    }, 1000);
                this.ANOTOTE_LOADED = true;
                this.ANOTOTE_LOADING_ERROR = false;
            }, (error) => {
                this.utilityMethods.hide_loader();
                this.ANOTOTE_LOADED = true;
                this.ANOTOTE_LOADING_ERROR = true;
                if (error.code == -1 || error.code == -2) {
                    this.utilityMethods.internet_connection_error();
                }
            });
    }

    change_full_screen_mode() {
        this.full_screen_mode = !this.full_screen_mode;
    }

    add_to_me_stream() {
        var params = {
            anotote: this.ANOTOTE,
            stream: this.WHICH_STREAM,
            from: 'editor'
        }
        let chatTote = this.modalCtrl.create(ChatToteOptions, params);
        chatTote.onDidDismiss((data) => {
            if (data.chat) {
                this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: true, anotote_id: this.ANOTOTE.userAnnotote.id, title: data.title });
            } else if (data.save) {
                if (this.WHICH_STREAM == 'anon') {
                    // this.utilityMethods.show_loader('');
                    var params = {
                        user_tote_id: this.tote_id,
                        created_at: this.utilityMethods.get_php_wala_time()
                    }
                    this.searchService.addToMeStream(params).subscribe((success) => {
                        this.utilityMethods.hide_loader();
                        this.ANOTOTE.userAnnotote.anototeDetail = this.ANOTOTE.userAnnotote;
                        this.ANOTOTE.active_tab = 'me';
                        this.ANOTOTE.followers = this.ANOTOTE.follows;
                        this.actual_stream = 'me';
                        this.which_stream = 'me';
                        this.WHICH_STREAM = 'me';
                        this.searchService.saved_searches.splice(this.searchService.saved_searches.indexOf(this.search_obj_to_be_deleted), 1)
                        this.runtime.me_first_load = false;
                        this.runtime.top_first_load = false;
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
                    this.utilityMethods.show_loader('', false);
                    this.anotote_service.save_totes(data).subscribe((result) => {
                        this.utilityMethods.hide_loader();
                        if (result.status == 1) {
                            this.runtime.me_first_load = false;
                            this.runtime.top_first_load = false;
                            this.runtime.follow_first_load = false;
                            this.utilityMethods.doToast("Saved to Me stream");
                        }
                    }, (error) => {
                        this.utilityMethods.hide_loader();
                        if (error.code == -1) {
                            this.utilityMethods.internet_connection_error();
                        }
                    })
                }

            } else if (data.bookmark) {
                var link = [];
                link.push(this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.annotote.link : this.ANOTOTE.annotote.link)
                var paraams: any = {
                    user_tote_id: this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.annotote.id : this.ANOTOTE.annotote.id,
                    user_id: this.user.id,
                    links: link,
                    created_at: this.utilityMethods.get_php_wala_time()
                }
                this.utilityMethods.show_loader('Bookmarking', false);
                this.anotote_service.bookmark_totes(paraams).subscribe((result) => {
                    this.utilityMethods.hide_loader();
                    if (result.status == 1) {
                        if (result.data.bookmarks.length > 0)
                            this.searchService.saved_searches.unshift(result.data.bookmarks[0]);
                        this.utilityMethods.doToast("Bookmarked.");
                    }
                }, (error) => {
                    this.utilityMethods.hide_loader();
                    if (error.code == -1) {
                        this.utilityMethods.internet_connection_error();
                    } else {
                        this.utilityMethods.doToast("Couldn't bookmark.");
                    }
                })
            }
        })
        chatTote.present();
    }

    private highlight_(com_or_quote, identifier, comment) {
        try {
            var self = this;
            if (com_or_quote == 'comment') {
                var selection = this.sel;
                var range = this.range;
            } else {
                var selection: any = window.getSelection();
                // var range = selection.getRangeAt(0);
                var range: any = document.createRange();
                range.setStart(this.selection.startContainer, this.selection.startOffset);
                range.setEnd(this.selection.endContainer, this.selection.endOffset);
            }

            // var nodes = [];
            // var node;
            // for (node = range.startContainer; node; node = node.nextSibling) {
            //     var tempStr = node.nodeValue;
            //     if (node.nodeValue != null && tempStr.replace(/^\s+|\s+$/gm, '') != '')
            //         nodes.push(node);
            //     if (node == range.endContainer)
            //         break;
            // }
            // nodes.push(range.endContainer);

            // for (var i = 0; i < nodes.length; i++) {
            //     var newNode = document.createElement("highlight_quote");

            //     newNode.setAttribute("data-selectedtxt", this.selectedText);
            //     newNode.setAttribute("data-identifier", identifier);
            //     if (type == 'comment') {
            //         newNode.setAttribute("class", "highlight_comment");
            //         newNode.setAttribute("data-comment", comment);
            //     }
            //     else {
            //         if (i == 0)
            //             newNode.setAttribute("class", "highlight_quote");
            //         else
            //             newNode.setAttribute("class", "only_light");
            //     }

            //     var sp1_content = document.createTextNode(nodes[i].nodeValue);
            //     newNode.appendChild(range.extractContents());
            //     var parentNode = nodes[i].parentNode;
            //     parentNode.insertBefore(newNode, nodes[i]);
            //     parentNode.replaceChild(newNode, nodes[i]);
            // }

            var newNode = document.createElement("highlight_quote");

            newNode.setAttribute("data-selectedtxt", this.selectedText);
            newNode.setAttribute("data-identifier", identifier);
            newNode.id = identifier;
            if (com_or_quote == 'comment') {
                newNode.setAttribute("class", "highlight_comment");
                newNode.setAttribute("data-comment", comment);
            }
            else
                newNode.setAttribute("class", "highlight_quote");
            newNode.appendChild(range.extractContents());
            // var parentNode = range.startContainer.parentNode;
            // parentNode.insertBefore(newNode, range.startContainer);
            range.insertNode(newNode);
            // range.surroundContents(newNode);
            selection.removeAllRanges();
            return true;
        } catch (e) {
            this.utilityMethods.message_alert("Oops", "You cannot overlap already annototed text.");
            return false;
        }
    }

    scrollTo(identifier: string) {
        let element: any = document.querySelectorAll('[data-identifier="' + identifier + '"]');
        if (element != null && element.length > 0) {
            let yOffset = element[0].offsetTop;
            this.content.scrollTo(0, yOffset, 2000)
        }
    }

    editor_click(event) {
        var identifier = event.target.getAttribute("data-identifier");
        if (identifier) {
            this.selected_highlight = {
                txt: event.target.getAttribute("data-selectedtxt"),
                identifier: event.target.getAttribute("data-identifier"),
                type: event.target.getAttribute("class"),
                from_where: '',
                comment: event.target.getAttribute("data-comment")
            };
            this.presentCommentDetailModal(this.selected_highlight, event.target);
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
        this.add_annotation_api('quote', null);
    }

    share_it() {
        this.selection_lock = true;
        this.toggle_annotation_option = false;
        this.content.resize();
        this.utilityMethods.share_content_native('Deep Link', 'Anotote Text Sharing', null, null);
    }

    popView() {
        this.navCtrl.pop();
    }

    openSearchPopup() {
        var url = null;
        let searchModal = this.modalCtrl.create(Search, {});
        searchModal.onDidDismiss(data => {
        });
        searchModal.present();
    }

    presentCommentDetailModal(highlight, element?) {
        let commentDetailModal = this.modalCtrl.create(CommentDetailPopup, { txt: highlight.txt, identifier: highlight.identifier, type: highlight.type, comment: highlight.comment, stream: this.actual_stream, anotation: this.get_highlight(highlight.identifier) });
        commentDetailModal.onDidDismiss(data => {
            if (data.delete) {
                this.utilityMethods.confirmation_message("Are you sure ?", "Do you really want to delete this annotation ?", () => {
                    this.remove_annotation_api(highlight.identifier, element);
                })
            } else if (data.update) {
                this.update_annotation_api(highlight.id, highlight.txt, data.comment, highlight.identifier, element);
            } else if (data.share) {
                this.utilityMethods.share_content_native('Deep Link', highlight.txt, null, null);
            } else if (data.upvote) {
                this.upvote(element.getAttribute('data-identifier'));
            } else if (data.downvote) {
                this.downvote(element.getAttribute('data-identifier'))
            } else if (data.tags) {
                this.show_annotation_tags(element.getAttribute('data-identifier'))
            }
        });
        commentDetailModal.present();
    }

    presentCreateAnotationModal() {
        if (this.selectedText == '') {
            this.selection_lock = false;
            return;
        }
        this.sel = window.getSelection();
        // this.range = this.sel.getRangeAt(0);
        this.range = document.createRange();
        this.range.setStart(this.selection.startContainer, this.selection.startOffset);
        this.range.setEnd(this.selection.endContainer, this.selection.endOffset);
        let createAnotationModal = this.modalCtrl.create(CreateAnotationPopup, { selected_txt: this.selectedText, range: this.range, sel: this.sel });
        createAnotationModal.onDidDismiss(data => {
            if (data.create) {
                this.create_anotation(data.comment);
            } else if (data.share) {
                this.utilityMethods.share_content_native('Deep Link', 'Anotote Text Sharing', null, null);
            }
            this.selection_lock = false;
        });
        createAnotationModal.present();
    }

    /**
     * Create Anotation Comment Type
     */
    private create_anotation(comment) {
        if (!comment)
            comment = '';
        this.add_annotation_api('comment', comment);
    }

    remove_annotation_api(an_id, element) {
        this.utilityMethods.show_loader('Please wait...');
        var current_time = this.utilityMethods.get_php_wala_time();
        element.replaceWith(element.innerText);
        var article_txt = document.getElementById('text_editor').innerHTML;
        var tote_id = '';
        if (this.WHICH_STREAM != 'me') {
            tote_id = this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.id : this.ANOTOTE.anototeDetail.meToteFollowTop.id;
        } else {
            tote_id = this.ANOTOTE.userAnnotote.id;
        }
        this.searchService.remove_anotation({ delete: 1, identifier: an_id, file_text: article_txt, user_annotate_id: tote_id })
            .subscribe((response) => {
                this.utilityMethods.hide_loader();
                if (this.WHICH_STREAM == 'me') {
                    this.runtime.top_first_load = false;
                    this.runtime.follow_first_load = false;
                    for (var i = 0; i < this.ANOTOTE.userAnnotote.annototeHeighlights.length; i++) {
                        if (this.ANOTOTE.userAnnotote.annototeHeighlights[i].id == response.data.annotote.id) {
                            this.ANOTOTE.userAnnotote.annototeHeighlights.splice(i, 1);
                            break;
                        }
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
                    } else {
                        this.runtime.follow_first_load = false;
                    }
                }
            }, (error) => {
                this.utilityMethods.hide_loader();
            });
    }

    update_annotation_api(anotation_id, highlight_text, comment, identifier, element) {
        this.utilityMethods.show_loader('Please wait...');
        var current_time = this.utilityMethods.get_php_wala_time();
        // element.replaceWith(element.innerText);
        element.className = "highlight_comment"
        element.setAttribute("data-comment", comment);
        var article_txt = document.getElementById('text_editor').innerHTML;
        var tote_id = '';
        if (this.WHICH_STREAM != 'me') {
            tote_id = this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.id : this.ANOTOTE.anototeDetail.meToteFollowTop.id;
        } else {
            tote_id = this.ANOTOTE.userAnnotote.id;
        }
        this.searchService.update_anotation({ highlight_text: highlight_text, identifier: identifier, user_tote_id: tote_id, file_text: article_txt, user_annotation_id: anotation_id, comment: comment, updated_at: current_time })
            .subscribe((response) => {
                this.utilityMethods.hide_loader();
                if (this.WHICH_STREAM == 'me') {
                    this.runtime.top_first_load = false;
                    this.runtime.follow_first_load = false;
                    for (let highlight of this.ANOTOTE.userAnnotote.annototeHeighlights) {
                        if (highlight.id == response.data.highlight.id) {
                            highlight.comment = response.data.highlight.comment;
                            break;
                        }
                    }
                } else {
                    this.runtime.me_first_load = false;
                    for (let highlight of this.ANOTOTE.my_highlights) {
                        if (highlight.id == response.data.highlight.id) {
                            highlight.comment = response.data.highlight.comment;
                            break;
                        }
                    }
                    if (this.WHICH_STREAM == 'follows') {
                        this.ANOTOTE.top_highlights = null;
                    }
                }
            }, (error) => {
                this.utilityMethods.hide_loader();
            });
    }

    add_annotation_api(type, comment) {
        // this.events.publish('tote:comment', { selection: this.selection, selected_txt: this.selectedText, type: type });
        var current_time = this.utilityMethods.get_php_wala_time();
        var identifier = this.generate_dynamic_identifier(current_time);
        if (!this.highlight_(type, identifier, comment))
            return;
        this.utilityMethods.show_loader('Please wait...');
        var article_txt = document.getElementById('text_editor').innerHTML;
        var tote_id = '';
        if (this.WHICH_STREAM != 'me') {
            tote_id = this.WHICH_STREAM == 'follows' ? this.ANOTOTE.userAnnotote.anototeDetail.meToteFollowTop.id : this.ANOTOTE.anototeDetail.meToteFollowTop.id;
        } else {
            tote_id = this.ANOTOTE.userAnnotote.id;
        }
        this.searchService.create_anotation({ identifier: identifier, user_tote_id: tote_id, highlight_text: this.selectedText, created_at: current_time, file_text: article_txt, comment: comment })
            .subscribe((response) => {
                this.utilityMethods.hide_loader();
                this.selectedText = '';
                this.selection_lock = false;
                if (this.actual_stream == 'anon') {
                    this.ANOTOTE.userAnnotote.anototeDetail = this.ANOTOTE.userAnnotote;
                    this.ANOTOTE.active_tab = 'me';
                    this.actual_stream = 'me';
                    this.which_stream = 'me';
                    this.WHICH_STREAM = 'me';
                    this.searchService.saved_searches.splice(this.searchService.saved_searches.indexOf(this.search_obj_to_be_deleted), 1)
                    this.runtime.me_first_load = false;
                    this.runtime.top_first_load = false;
                } else {
                    if (this.WHICH_STREAM == 'me') {
                        this.runtime.top_first_load = false;
                        this.runtime.follow_first_load = false;
                        this.ANOTOTE.userAnnotote.annototeHeighlights.push(response.data.annotation);
                    } else if (this.WHICH_STREAM == 'follows' || this.WHICH_STREAM == 'top') {
                        this.runtime.me_first_load = false;
                        this.ANOTOTE.my_highlights.push(response.data.annotation);
                        if (this.WHICH_STREAM == 'follows') {
                            this.runtime.top_first_load = false;
                            this.ANOTOTE.top_highlights = null;
                        } else {
                            this.runtime.follow_first_load = false;
                        }
                    }
                }
            }, (error) => {
                this.utilityMethods.hide_loader();
                if (error.code == -1) {
                    this.utilityMethods.internet_connection_error();
                }
                this.selection_lock = false;
            });
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
        this.utilityMethods.show_loader('');
        var currentHighlight = this.get_highlight(id)
        var params = {
            annotation_id: currentHighlight.id,
            vote: 1,
            created_at: this.utilityMethods.get_php_wala_time()
        }
        this.searchService.vote_anotation(params).subscribe((result) => {
            this.utilityMethods.hide_loader();
            this.utilityMethods.doToast("Up voted")
            currentHighlight.isCurrentUserVote = 1;
            currentHighlight.currentUserVote = 1;
            currentHighlight.rating = result.data.annotation.rating;
        }, () => {
            this.utilityMethods.hide_loader();
        });
    }

    downvote(id) {
        this.utilityMethods.show_loader('');
        var currentHighlight = this.get_highlight(id);
        var params = {
            annotation_id: currentHighlight.id,
            vote: 0,
            identifier: id,
            created_at: this.utilityMethods.get_php_wala_time()
        }
        this.searchService.vote_anotation(params).subscribe((result) => {
            this.utilityMethods.hide_loader();
            this.utilityMethods.doToast("downvoted");
            currentHighlight.isCurrentUserVote = 1;
            currentHighlight.currentUserVote = 0;
            currentHighlight.rating = result.data.annotation.rating;
        }, () => {
            this.utilityMethods.hide_loader();
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
            annotation_id: this.ANOTOTE.userAnnotote.id,
            tags: this.get_highlight(id).tags,
            whichStream: this.actual_stream,
            annotote: false
        }
        let tagsModal = this.modalCtrl.create(TagsPopUp, params);
        tagsModal.present();
    }

    presentViewOptionsModal() {
        var params = {
            anotote: this.WHICH_STREAM == 'anon' ? this.ANOTOTE.userAnnotote : this.ANOTOTE,
            stream: this.WHICH_STREAM
        }
        let viewsOptionsModal = this.modalCtrl.create(ViewOptions, params);
        viewsOptionsModal.onDidDismiss((preference) => {
            if (preference.tab_selected == 'me')
                this.showMeHighlights(this.ANOTOTE);
            else if (preference.tab_selected == 'follows' && this.WHICH_STREAM != 'top' && this.WHICH_STREAM != 'anon')
                this.open_follows_popup(event, this.ANOTOTE);
            else if (preference.tab_selected == 'follows' && (this.WHICH_STREAM == 'top' || this.WHICH_STREAM == 'anon')) {
                if (this.WHICH_STREAM == 'anon')
                    this.top_follows_popup(event, this.ANOTOTE.userAnnotote);
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
            anotote.active_tab = 'me'
            this.actual_stream = anotote.active_tab;
            this.scrape_anotote(anotote.meFilePath);
        } else if (this.WHICH_STREAM == 'follows' || this.WHICH_STREAM == 'top') {
            if (this.WHICH_STREAM == 'top' && anotote.anototeDetail.meToteFollowTop.id == anotote.userAnnotote.id) {
                anotote.my_highlights = anotote.top_highlights;
                anotote.highlights = Object.assign(anotote.my_highlights);
                anotote.active_tab = 'me'
                anotote.meFilePath = anotote.anototeDetail.userAnnotote.filePath;
                this.actual_stream = anotote.active_tab;
                this.scrape_anotote(anotote.meFilePath);
            } else if (anotote.my_highlights == undefined) {
                this.utilityMethods.show_loader('')
                var params = {
                    user_id: this.user.id,
                    anotote_id: this.WHICH_STREAM == 'follows' ? anotote.userAnnotote.anototeDetail.meToteFollowTop.id : anotote.anototeDetail.meToteFollowTop.id,
                    time: this.utilityMethods.get_php_wala_time()
                }
                this.anotote_service.fetchToteDetails(params).subscribe((result) => {
                    this.utilityMethods.hide_loader();
                    if (result.status == 1) {
                        anotote.active_tab = 'me'
                        anotote.highlights = Object.assign(result.data.annotote.highlights);
                        anotote.my_highlights = result.data.annotote.highlights;
                        anotote.meFilePath = result.data.annotote.userAnnotote.filePath;
                        this.actual_stream = anotote.active_tab;
                        this.scrape_anotote(anotote.meFilePath);
                    } else {
                        this.utilityMethods.doToast("Couldn't fetch annotations");
                        anotote.active = false;
                    }
                }, (error) => {
                    //   this.me_spinner = false;
                    if (error.code == -1) {
                        this.utilityMethods.internet_connection_error();
                    }
                });
            } else {
                anotote.active_tab = 'me';
                anotote.highlights = Object.assign(anotote.my_highlights);
                this.actual_stream = anotote.active_tab;
                this.scrape_anotote(anotote.meFilePath);
            }
        }
    }

    show_top_tab(anotote) {
        this.content.scrollToTop();
        if (this.WHICH_STREAM != 'anon') {
            if (anotote.top_highlights == undefined) {
                if (anotote.userAnnotote.id != anotote.topUserToteId) {
                    this.utilityMethods.show_loader('')
                    var params = {
                        user_id: this.user.id,
                        anotote_id: anotote.topUserToteId,
                        time: this.utilityMethods.get_php_wala_time()
                    }
                    this.anotote_service.fetchToteDetails(params).subscribe((result) => {
                        this.utilityMethods.hide_loader();
                        anotote.active_tab = 'top'
                        anotote.topFilePath = result.data.annotote.userAnnotote.filePath;
                        this.actual_stream = anotote.active_tab;
                        this.scrape_anotote(anotote.topFilePath);
                        if (result.status == 1) {
                            anotote.highlights = Object.assign(result.data.annotote.highlights);
                            anotote.top_highlights = result.data.annotote.highlights;
                        } else {
                            this.utilityMethods.doToast("Could not fetch top data");
                        }
                    }, (error) => {
                        this.utilityMethods.hide_loader();
                        if (error.code == -1) {
                            this.utilityMethods.internet_connection_error();
                        }
                    })
                } else {
                    anotote.top_highlights = anotote.userAnnotote.annototeHeighlights;
                    anotote.active_tab = 'top';
                    anotote.topFilePath = anotote.userAnnotote.filePath;
                    this.actual_stream = anotote.active_tab;
                    this.scrape_anotote(anotote.topFilePath);
                }
            } else {
                anotote.active_tab = 'top'
                anotote.highlights = Object.assign(anotote.top_highlights);
                this.actual_stream = anotote.active_tab;
                this.scrape_anotote(anotote.topFilePath);
            }
        } else {
            if (anotote.top_highlights == undefined) {
                this.utilityMethods.show_loader('')
                var params = {
                    user_id: this.user.id,
                    anotote_id: anotote.userAnnotote.topUserToteId,
                    time: this.utilityMethods.get_php_wala_time()
                }
                this.anotote_service.fetchToteDetails(params).subscribe((result) => {
                    this.utilityMethods.hide_loader();
                    anotote.active_tab = 'top'
                    this.ANOTOTE.userAnnotote.active_tab = 'top';
                    anotote.topFilePath = result.data.annotote.userAnnotote.filePath;
                    this.actual_stream = anotote.active_tab;
                    this.scrape_anotote(anotote.topFilePath);
                    if (result.status == 1) {
                        anotote.highlights = Object.assign(result.data.annotote.highlights);
                        anotote.top_highlights = result.data.annotote.highlights;
                    } else {
                        this.utilityMethods.doToast("Could not fetch top data");
                    }
                }, (error) => {
                    this.utilityMethods.hide_loader();
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
        event.stopPropagation();
        if (anotote.followers.length == 1) {
            anotote.selected_follower_name = anotote.followers[0].firstName;
            anotote.active_tab = 'follows';
            anotote.followerFilePath = anotote.followers[0].followTote.filePath;
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
                        this.loadFollower(anotote, data.user);
                    }
                });
                anototeOptionsModal.present();
            } else {
                anotote.selected_follower_name = anotote.followers[0].firstName;
                anotote.active_tab = 'follows';
                this.follow_visited = true;
                anotote.followerFilePath = anotote.followers[0].followTote.filePath;
                this.loadFollower(anotote, anotote.followers[0])
            }
        } else {
            this.utilityMethods.doToast('No one follows this anotote.');
        }

    }

    loadFollower(anotote, user) {
        if (user.highlights == null) {
            this.utilityMethods.show_loader('')
            var params = {
                user_id: user.id,
                anotote_id: user.followTote.id,
                time: this.utilityMethods.get_php_wala_time()
            }
            this.anotote_service.fetchToteDetails(params).subscribe((result) => {
                this.utilityMethods.hide_loader();
                user.highlights = result.data.annotote.highlights;
                anotote.highlights = Object.assign(result.data.annotote.highlights);
                this.actual_stream = anotote.active_tab;
                this.scrape_anotote(anotote.followerFilePath);
            }, (error) => {
                this.utilityMethods.hide_loader();
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
        event.stopPropagation();
        if (anotote.follows.length == 1) {
            anotote.selected_follower_name = anotote.follows[0].firstName;
            anotote.active_tab = 'follows';
            if (this.WHICH_STREAM == 'anon') {
                this.ANOTOTE.active_tab = 'follows'
                this.ANOTOTE.followers = anotote.follows;
            }
            this.actual_stream = anotote.active_tab;
            anotote.followerFilePath = anotote.follows[0].followTote.filePath;
            this.loadFollower(anotote, anotote.follows[0])
        } else if (anotote.follows.length > 1) {
            if (this.follow_visited) {
                let anototeOptionsModal = this.modalCtrl.create(FollowsPopup, { follows: anotote.follows });
                anototeOptionsModal.onDidDismiss(data => {
                    if (data != null) {
                        anotote.selected_follower_name = data.user.firstName;
                        anotote.active_tab = 'follows'
                        if (this.WHICH_STREAM == 'anon') {
                            this.ANOTOTE.active_tab = 'follows';
                            this.ANOTOTE.followers = anotote.follows;
                        }
                        this.actual_stream = anotote.active_tab;
                        anotote.followerFilePath = data.user.followTote.filePath;
                        this.loadFollower(anotote, data.user);
                    }
                });
                anototeOptionsModal.present();
            } else {
                anotote.selected_follower_name = anotote.followers[0].firstName;
                anotote.active_tab = 'follows';
                if (this.WHICH_STREAM == 'anon') {
                    this.ANOTOTE.active_tab = 'follows'
                    this.ANOTOTE.followers = anotote.follows;
                }
                anotote.followerFilePath = anotote.follows[0].followTote.filePath;
                this.loadFollower(anotote, anotote.follows[0])
            }
        } else {
            this.utilityMethods.doToast('No one follows this anotote.');
        }

    }

}
