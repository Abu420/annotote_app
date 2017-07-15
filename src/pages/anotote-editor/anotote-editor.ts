import { Component, ElementRef, Input, Pipe, PipeTransform, ViewChild, Output, Directive, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
import { AuthenticationService } from '../../services/auth.service';

@Pipe({
    name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {

    constructor(private _sanitizer: DomSanitizer) {
    }

    transform(v: string): SafeHtml {
        this._sanitizer.bypassSecurityTrustStyle(v);
        return this._sanitizer.bypassSecurityTrustHtml(v);
    }
}

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
    public start = 0;
    public threshold = 100;
    public slideHeaderPrevious = 0;
    public ionScroll: any;
    public showheader: boolean;
    public hideheader: boolean;
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
    private show_anotation_details: (txt: string) => void;

    constructor(public myElement: ElementRef, private _sanitizer: DomSanitizer, private authService: AuthenticationService, private socialSharing: SocialSharing, private events: Events, private searchService: SearchService, private navCtrl: NavController, private navParams: NavParams, private modalCtrl: ModalController, private utilityMethods: UtilityMethods) {
        var that = this;
        this.toggle_annotation_option = false;
        this.selection_lock = false;
        /**
         * Get Page Params
         */
        this.ANOTOTE = navParams.get('ANOTOTE');
        this.FROM = navParams.get('FROM');
        this.WHICH_STREAM = navParams.get('WHICH_STREAM');
        this.which_stream = this.WHICH_STREAM;
        this.HIGHLIGHT_RECEIVED = navParams.get('HIGHLIGHT_RECEIVED');
        this.tote_id = this.ANOTOTE.userAnnotote.id;
        this.main_anotote_id = this.ANOTOTE.annototeId;
        this.tote_user_id = this.ANOTOTE.userAnnotote.userId;
        if (this.FROM == 'anotote_list')
            this.from_where = 'anotote_list';
        else
            this.from_where = 'new_anotote';
        this.full_screen_mode = false;

        this.scrape_anotote(this.ANOTOTE.userAnnotote.filePath);

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
         * Content Scroll hide/show header
         */
        this.showheader = false;
        this.hideheader = true;
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
        this.events.subscribe('show_tote_options', (data) => {
            if (this.which_stream == 'me') {
                this.toggle_annotation_option = data.flag;
                this.content.resize();
                if (data.flag && !this.selection_lock) {
                    this.selectedText = data.txt;
                    this.selection = data.selection;
                    this.content.resize();
                }
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
        this.utilityMethods.show_loader('');
        this.searchService.get_anotote_content(file_path)
            .subscribe((response_content) => {
                this.utilityMethods.hide_loader();
                this.text = response_content.text();
                var that = this;
                if (this.from_where == 'anotote_list')
                    setTimeout(function () {
                        that.scrollTo(that.HIGHLIGHT_RECEIVED.identifier);
                    }, 1000);
            }, (error) => {
                this.utilityMethods.hide_loader();
                if (error.code == -1 || error.code == -2) {
                    this.utilityMethods.internet_connection_error();
                }
            });
    }

    change_full_screen_mode() {
        this.full_screen_mode = !this.full_screen_mode;
    }

    add_to_me_stream() {
        this.utilityMethods.show_loader('Please wait...');
        var current_time = this.utilityMethods.get_php_wala_time();
        var params = {
            annotote_id: this.main_anotote_id,
            user_id: this.tote_user_id,
            created_at: current_time
        };
        this.searchService.save_anotote_to_me_stream(params)
            .subscribe((res) => {
                this.utilityMethods.hide_loader();
                if (res.data.code == 444) {
                    this.utilityMethods.doToast("This anotote is already added to your me stream.");
                    return;
                }
                this.utilityMethods.doToast("This anotote is added to your me stream successfully.");
            }, (error) => {
                this.utilityMethods.hide_loader();
            });
    }

    private highlight_(type, identifier, comment) {
        try {
            var self = this;
            var selection = window.getSelection();
            var range = document.createRange();
            range.setStart(this.selection.startContainer, this.selection.startOffset);
            range.setEnd(this.selection.endContainer, this.selection.endOffset);
            var newNode = document.createElement("highlight_quote");
            // newNode.onclick = function (this, evt) {
            //     evt.stopPropagation();
            //     var text = this.getAttribute('data-selectedtxt');
            //     self.events.publish('show_anotation_details', { txt: text });
            // }
            newNode.setAttribute("data-selectedtxt", this.selectedText);
            newNode.setAttribute("data-identifier", identifier);
            if (type == 'comment') {
                newNode.setAttribute("class", "highlight_comment");
                newNode.setAttribute("data-comment", comment);
            }
            else
                newNode.setAttribute("class", "highlight_quote");

            range.surroundContents(newNode);
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
        // console.log(event.target.getAttribute("class"));
        // console.log(event.target.getAttribute("data-identifier"));
        // console.log(event.target.getAttribute("data-selectedtxt"));
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
        let commentDetailModal = this.modalCtrl.create(CommentDetailPopup, { txt: highlight.txt, identifier: highlight.identifier, type: highlight.type, comment: highlight.comment });
        commentDetailModal.onDidDismiss(data => {
            if (data.delete) {
                this.remove_annotation_api(highlight.identifier, element);
            } else if (data.update) {
                this.update_annotation_api(highlight.id, highlight.txt, data.comment, highlight.identifier, element);
            } else if (data.share) {
                this.utilityMethods.share_content_native('Deep Link', highlight.txt, null, null);
            }
        });
        commentDetailModal.present();
    }

    presentCreateAnotationModal() {
        if (this.selectedText == '') {
            this.selection_lock = false;
            return;
        }
        let createAnotationModal = this.modalCtrl.create(CreateAnotationPopup, { selected_txt: this.selectedText });
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
        this.searchService.remove_anotation({ delete: 1, identifier: an_id, file_text: article_txt, user_annotate_id: this.tote_id })
            .subscribe((response) => {
                this.utilityMethods.hide_loader();
            }, (error) => {
                this.utilityMethods.hide_loader();
            });
    }

    update_annotation_api(anotation_id, highlight_text, comment, identifier, element) {
        this.utilityMethods.show_loader('Please wait...');
        var current_time = this.utilityMethods.get_php_wala_time();
        // element.replaceWith(element.innerText);
        element.setAttribute("data-comment", comment);
        var article_txt = document.getElementById('text_editor').innerHTML;
        this.searchService.update_anotation({ highlight_text: highlight_text, identifier: identifier, user_tote_id: this.tote_id, file_text: article_txt, user_annotation_id: anotation_id, comment: comment, updated_at: current_time })
            .subscribe((response) => {
                this.utilityMethods.hide_loader();
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
        this.searchService.create_anotation({ identifier: identifier, user_tote_id: this.tote_id, highlight_text: this.selectedText, created_at: current_time, file_text: article_txt, comment: comment })
            .subscribe((response) => {
                this.utilityMethods.hide_loader();
                this.selectedText = '';
                this.selection_lock = false;
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

}
