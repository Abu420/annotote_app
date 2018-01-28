import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
import { UtilityMethods } from '../../services/utility_methods';
import { StatusBar } from "@ionic-native/status-bar";
@Component({
    selector: 'verification_pop',
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
    templateUrl: 'verification.html',
})
export class Verification {
    public show: boolean = true;
    constructor(public statusbar: StatusBar,
        public viewCtrl: ViewController,
        private params: NavParams,
        private utilityMethods: UtilityMethods) {
        statusbar.hide();

    }

    dismiss() {
        this.statusbar.show();
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss();
        })
    }

}