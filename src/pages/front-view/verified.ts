import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
import { UtilityMethods } from '../../services/utility_methods';
import { StatusBar } from "@ionic-native/status-bar";
@Component({
    selector: 'verified_pop',
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
    templateUrl: 'verified.html',
})
export class Verified {
    public show: boolean = true;
    public signup_or_forgot: boolean = true;
    public verified: boolean = false;
    constructor(public statusbar: StatusBar,
        public viewCtrl: ViewController,
        private params: NavParams,
        private utilityMethods: UtilityMethods) {
        statusbar.hide();
        if (params.get('forgot')) {
            this.signup_or_forgot = false;
            this.verified = params.get('verified');
        }

    }

    dismiss() {
        this.statusbar.show();
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss();
        })
    }

    signIn() {
        this.statusbar.show();
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss('signin');
        })
    }

}