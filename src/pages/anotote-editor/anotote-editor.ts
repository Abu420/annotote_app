import { Component, Input, Pipe, PipeTransform, ViewChild, Output, Directive, OnDestroy } from '@angular/core';
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
    public toggle_annotation_option: boolean;
    public htmlStr: string = '<strong>The Tortoise</strong> &amp; the Hare';
    private selectedText: string;
    private selection: any;
    private highlight: any;
    private selected_highlight: { txt: '', identifier: '', type: '' };
    private selection_lock: boolean;
    private anotote_type: string; // 'me' for Me type, then 'follows' && 'top'
    private text: string; // Anotote article whole text
    private tote_id: string;
    private full_screen_mode: boolean;
    private detail_event: any;
    private which_stream: string;
    private show_anotation_details: (txt: string) => void;

    constructor(private _sanitizer: DomSanitizer, private authService: AuthenticationService, private socialSharing: SocialSharing, private events: Events, private searchService: SearchService, private navCtrl: NavController, private navParams: NavParams, private modalCtrl: ModalController, private utilityMethods: UtilityMethods) {
        var that = this;
        this.toggle_annotation_option = false;
        this.selection_lock = false;
        /**
         * Get Page Params
         */
        this.text = navParams.get('tote_txt');
        this.tote_id = navParams.get('anotote_id');
        this.anotote_type = navParams.get('anotote_type');
        this.which_stream = navParams.get('which_stream');
        this.highlight = navParams.get('highlight');
        this.full_screen_mode = false;
        setTimeout(function () {
            that.scrollTo(that.highlight.identifier);
        }, 1000);
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
        console.log(this.which_stream);

    }

    /**
     * Page LifeCycle Events
     */
    ionViewDidLoad() {
        this.events.subscribe('show_tote_options', (data) => {
            if (this.which_stream == 'me') {
                this.toggle_annotation_option = data.flag;
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

    private highlight_(type, identifier) {
        try {
            var self = this;
            var selection = window.getSelection();
            var range = document.createRange();
            range.setStart(this.selection.startContainer, this.selection.startOffset);
            range.setEnd(this.selection.endContainer, this.selection.endOffset);
            var newNode = document.createElement("highlight_quote");
            newNode.onclick = function (this, evt) {
                evt.stopPropagation();
                var text = this.getAttribute('data-selectedtxt');
                self.events.publish('show_anotation_details', { txt: text });
            }
            newNode.setAttribute("data-selectedtxt", this.selectedText);
            newNode.setAttribute("data-identifier", identifier);
            if (type == 'comment')
                newNode.setAttribute("class", "highlight_comment");
            else
                newNode.setAttribute("class", "highlight_quote");

            range.surroundContents(newNode);
            selection.removeAllRanges();
        } catch (e) {
            console.log(e);
        }
    }

    scrollTo(identifier: string) {
        console.log(identifier);
        let element: any = document.querySelectorAll('[data-identifier="' + identifier + '"]');
        console.log(element);
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
            console.log(event.target);
            this.selected_highlight = {
                txt: event.target.getAttribute("data-selectedtxt"),
                identifier: event.target.getAttribute("data-identifier"),
                type: event.target.getAttribute("class")
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

    presentCommentDetailModal(highlight, element) {
        let commentDetailModal = this.modalCtrl.create(CommentDetailPopup, { txt: highlight.txt, identifier: highlight.identifier });
        commentDetailModal.onDidDismiss(data => {
            if (data.delete) {
                console.log(highlight)
                this.remove_annotation_api(highlight.identifier, element);
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
        this.add_annotation_api('comment', comment);
    }

    remove_annotation_api(an_id, element) {
        this.utilityMethods.show_loader('Please wait...');
        var current_time = (new Date()).getTime() / 1000;
        element.replaceWith(element.innerText);
        var article_txt = document.getElementById('text_editor').innerHTML;
        this.searchService.remove_anotation({ delete: 1, identifier: an_id, file_text: article_txt, user_annotate_id: this.tote_id })
            .subscribe((response) => {
                this.utilityMethods.hide_loader();
            }, (error) => {
                this.utilityMethods.hide_loader();
            });
    }

    add_annotation_api(type, comment) {
        // this.events.publish('tote:comment', { selection: this.selection, selected_txt: this.selectedText, type: type });
        var current_time = (new Date()).getTime() / 1000;
        var identifier = this.generate_dynamic_identifier(this.tote_id, this.authService.getUser().id, current_time);
        this.highlight_(type, identifier);
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

    generate_dynamic_identifier(anotote_id, user_id, time) {
        return anotote_id + '_' + user_id + '_' + time;
    }

    presentCreateAnotationOptionsModal() {
        let createAnotationOptionsModal = this.modalCtrl.create(CreateAnotationOptionsPopup, { selected_txt: this.selectedText });
        createAnotationOptionsModal.onDidDismiss(data => {
            this.selection_lock = false;
        });
        createAnotationOptionsModal.present();
    }

}
