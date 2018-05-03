import { Component, trigger, transition, style, animate, ViewChild } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, Content } from 'ionic-angular';
import { UtilityMethods } from '../../services/utility_methods';
import { StatusBar } from "@ionic-native/status-bar";
import { Keyboard } from '@ionic-native/keyboard';
@Component({
    selector: 'tags_options',
    animations: [
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({ transform: 'translateY(100%)', opacity: 0 }),
                    animate('500ms', style({ transform: 'translateY(0)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'translateY(0)', opacity: 1 }),
                    animate('500ms', style({ transform: 'translateY(100%)', opacity: 0 }))
                ])
            ]
        )],
    templateUrl: 'tags_options.html',
})
export class TagsOptions {
    @ViewChild(Content) content: Content;
    public tag;
    public show: boolean = true;
    public is_tag = true;
    public temp_title = '';
    constructor(public statusbar: StatusBar,
        public viewCtrl: ViewController,
        private params: NavParams,
        public key: Keyboard,
        private utilityMethods: UtilityMethods) {
        if (this.utilityMethods.platform.is('ios'))
            statusbar.hide();
        this.tag = params.get('tag');
        if (params.get('is_tag') == false) {
            this.is_tag = false;
            this.temp_title = Object.assign(this.tag);
        }
    }

    dismiss(del) {
        this.statusbar.show();
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss({
                delete: del,
                title: this.temp_title
            });
        })
    }

}