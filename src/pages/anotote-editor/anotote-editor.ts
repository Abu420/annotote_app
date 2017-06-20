import { Component, Input, Pipe, PipeTransform, ViewChild, Output, Directive, ElementRef, Renderer, EventEmitter, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonicPage, NavController, Events, Content, NavParams, ModalController } from 'ionic-angular';
import { CommentDetailPopup } from '../anotote-editor/comment_detail_popup';
import { CreateAnotationPopup } from '../anotote-editor/create_anotation';
import { CreateAnotationOptionsPopup } from '../anotote-editor/create_anotation_options';
import { TextEditor } from '../directives/editor';
import { SocialSharing } from '@ionic-native/social-sharing';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';

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
export class AnototeEditor {
    @ViewChild(Content) content: Content;
    public show_tote_options_flag: number;
    public htmlStr: string = '<strong>The Tortoise</strong> &amp; the Hare';
    private selectedText: string;
    private selection: any;
    private selection_lock: boolean;
    private anotote_type: string; // 'me' for Me type, then 'follows' && 'top'
    private text: string; // Anotote article whole text
    private tote_id: string;

    constructor(private _sanitizer: DomSanitizer, private socialSharing: SocialSharing, private events: Events, private searchService: SearchService, private navCtrl: NavController, private navParams: NavParams, private modalCtrl: ModalController, private utilityMethods: UtilityMethods) {
        this.show_tote_options_flag = 0;
        this.selection_lock = false;
        /**
         * Get Page Params
         */
        this.text = navParams.get('tote_txt');
        this.tote_id = navParams.get('anotote_id');
        this.anotote_type = navParams.get('anotote_type');
        if (this.anotote_type == null)
            this.anotote_type = 'me';

        /**
         * Document Selection Listner
         */
        document.addEventListener("selectionchange", function () {
            var sel = getSelection(),
                selected_txt = sel.toString();
            if (selected_txt != '') {
                var range = sel.getRangeAt(0);
                var current_selection = { "startContainer": range.startContainer, "startOffset": range.startOffset, "endContainer": range.endContainer, "endOffset": range.endOffset };
                events.publish('show_tote_options', { flag: 1, txt: selected_txt, selection: current_selection });
            } else {
                events.publish('show_tote_options', { flag: 0, txt: '', selection: '' });
            }
        });
    }

    private highlight_(type) {
        console.log(type)
        try {
            var self = this;
            var selection = window.getSelection();
            var range = document.createRange();
            range.setStart(this.selection.startContainer, this.selection.startOffset);
            range.setEnd(this.selection.endContainer, this.selection.endOffset);
            var newNode = document.createElement("span");
            newNode.onclick = function (this, evt) {
                evt.stopPropagation();
                var text = this.getAttribute('data-txt');
                self.events.publish('show_anotation_details', { txt: text });
            }
            newNode.setAttribute("data-txt", this.selectedText);
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

    /**
     * Page LifeCycle Events
     */
    ionViewDidLoad() {
        this.events.subscribe('show_tote_options', (data) => {
            this.show_tote_options_flag = data.flag;
            if (data.flag && !this.selection_lock) {
                this.selectedText = data.txt;
                this.selection = data.selection;
                // this.content.resize();
            }
        });

        this.events.subscribe('show_anotation_details', (data) => {
            this.presentCommentDetailModal(data.txt);
        });
    }

    onPageWillLeave() {
        this.events.unsubscribe('show_tote_options', function () {
            console.log('here')
        });

        this.events.unsubscribe('show_anotation_details', function () {
            console.log('here 2')
        });
    }

    share_it() {
        this.socialSharing.share(this.selectedText, 'Anotote Text Sharing', null, null).then(() => {
            // Sharing via email is possible
        }).catch(() => {
            // Sharing via email is not possible
        });
    }

    comment_it() {
        this.selection_lock = true;
        this.show_tote_options_flag = 0;
        this.content.resize();
        this.presentCreateAnotationModal();
    }

    quote_it() {
        this.selection_lock = true;
        this.show_tote_options_flag = 0;
        this.content.resize();
        this.add_annotation_api('quote', null);
    }

    popView() {
        this.navCtrl.pop();
    }

    presentCommentDetailModal(txt) {
        let commentDetailModal = this.modalCtrl.create(CommentDetailPopup, { txt: txt });
        commentDetailModal.present();
    }

    presentCreateAnotationModal() {
        if (this.selectedText == '') {
            this.selection_lock = false;
            return;
        }
        let createAnotationModal = this.modalCtrl.create(CreateAnotationPopup, { selected_txt: this.selectedText });
        createAnotationModal.onDidDismiss(data => {
            console.log(data)
            if (data.status) {
                this.create_anotation(data.comment);
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

    add_annotation_api(type, comment) {
        // this.events.publish('tote:comment', { selection: this.selection, selected_txt: this.selectedText, type: type });
        this.highlight_(type);
        this.utilityMethods.show_loader('Please wait...');
        var current_time = (new Date()).getTime() / 1000;
        var article_txt = document.getElementById('text_editor').innerHTML;
        this.searchService.create_anotation({ user_tote_id: this.tote_id, highlight_text: this.selectedText, created_at: current_time, file_text: article_txt, comment: comment })
            .subscribe((response) => {
                this.utilityMethods.hide_loader();
                this.selectedText = '';
                this.selection_lock = false;
            }, (error) => {
                this.utilityMethods.hide_loader();
                this.selection_lock = false;
            });
    }

    presentCreateAnotationOptionsModal() {
        let createAnotationOptionsModal = this.modalCtrl.create(CreateAnotationOptionsPopup, { selected_txt: this.selectedText });
        createAnotationOptionsModal.onDidDismiss(data => {
            this.selection_lock = false;
        });
        createAnotationOptionsModal.present();
    }

}
