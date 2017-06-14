import { Component, Input, ViewChild, Output, Directive, ElementRef, Renderer, EventEmitter, OnInit } from '@angular/core';
import { IonicPage, NavController, Events, Content, NavParams, ModalController } from 'ionic-angular';
import { CommentDetailPopup } from '../anotote-editor/comment_detail_popup';
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
    public show_tote_options: boolean;

    public text = "NYT website down after cyber attack on domain registrar, Melbourne IT. The hacking was just the latest of a major media organization, with The Financial Times and The Washington Post also having their operations disrupted within the last few months. It was also the second time this month that the Web site of The New York Times was unavailable for several hours. Marc Frons, chief information officer for The New York Times Company, issued a statement at 4:20 p.m. on Tuesday warning employees that the disruption — which appeared to be affecting the Web site well into the evening — was “the result of a malicious external attack.” He advised employees to “be careful when sending e-mail communications until this situation is resolved.” In an interview, Mr. Frons said the attack was carried out by a group known as “the Syrian Electronic";

    constructor(public events: Events, public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods) {
        events.subscribe('show_tote_options', (flag) => {
            this.show_tote_options = flag;
            this.content.resize();
        });
    }

    comment_it() {
        this.events.publish('tote:comment', true);
        this.show_tote_options = false;
        this.content.resize();
    }

    popView() {
        this.navCtrl.pop();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AnototeEditor');
    }

    presentCommentDetailModal() {
        console.log(this.editorContent)
        let commentDetailModal = this.modalCtrl.create(CommentDetailPopup, null);
        commentDetailModal.present();
    }

}
