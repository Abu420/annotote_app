import { Component, Input, ViewChild, Output, Directive, ElementRef, Renderer, EventEmitter, OnInit } from '@angular/core';
import { IonicPage, NavController, Events, Content, NavParams, ModalController } from 'ionic-angular';
import { CommentDetailPopup } from '../anotote-editor/comment_detail_popup';
import { CreateAnotationPopup } from '../anotote-editor/create_anotation';
import { CreateAnotationOptionsPopup } from '../anotote-editor/create_anotation_options';
import { TextEditor } from '../directives/editor';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';

@IonicPage()
@Component({
    selector: 'page-anotote-editor',
    templateUrl: 'anotote-editor.html'
})
export class AnototeEditor {
    @ViewChild(Content) content: Content;
    public editorContent: string;
    public show_tote_options_flag: boolean;
    private selectedText: string;
    private selection: Selection;
    private selection_lock: boolean;
    private text: string;

    constructor(public events: Events, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods) {
        this.show_tote_options_flag = false;
        this.selection_lock = false;
        events.subscribe('show_tote_options', (data) => {
            if (data.flag && !this.selection_lock) {
                this.show_tote_options_flag = data.flag;
                this.selectedText = data.txt;
                this.selection = data.selection;
                this.content.resize();
            }
        });

        events.subscribe('show_anotation_details', (data) => {
            this.presentCommentDetailModal(data.txt);
        });
        this.text = navParams.get('tote_txt');
    }

    comment_it() {
        this.selection_lock = true;
        this.show_tote_options_flag = false;
        this.content.resize();
        this.presentCreateAnotationModal();
    }

    quote_it() {
        // this.events.publish('tote:comment', true);
        this.show_tote_options_flag = false;
        this.content.resize();
        this.presentCreateAnotationModal();
    }

    popView() {
        this.navCtrl.pop();
    }

    ionViewDidLoad() {
    }

    presentCommentDetailModal(txt) {
        let commentDetailModal = this.modalCtrl.create(CommentDetailPopup, { txt: txt });
        commentDetailModal.present();
    }

    presentCreateAnotationModal() {
        let createAnotationModal = this.modalCtrl.create(CreateAnotationPopup, { selected_txt: this.selectedText });
        createAnotationModal.onDidDismiss(data => {
            if (data == 'done') {
                console.log('done')
                this.events.publish('tote:comment', { selection: this.selection, selected_txt: this.selectedText });
            }
            this.selection_lock = false;
        });
        createAnotationModal.present();
    }

    presentCreateAnotationOptionsModal() {
        let createAnotationOptionsModal = this.modalCtrl.create(CreateAnotationOptionsPopup, { selected_txt: this.selectedText });
        createAnotationOptionsModal.onDidDismiss(data => {
            this.selection_lock = false;
        });
        createAnotationOptionsModal.present();
    }

}
