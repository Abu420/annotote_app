import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
@Component({
    selector: 'create_anotation_popup',
    animations: [
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({ transform: 'translateY(100%)', opacity: 0 }),
                    animate('300ms', style({ transform: 'translateY(0)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'translateY(0)', opacity: 1 }),
                    animate('300ms', style({ transform: 'translateY(100%)', opacity: 0 }))
                ])
            ]
        )
    ],
    templateUrl: 'create_anotation.html',
})
export class CreateAnotationPopup {
    private selectedTxt: string;
    private comment: string;
    private range: string;
    private sel: string;
    private show: boolean = true;

    constructor(public params: NavParams, public viewCtrl: ViewController) {
        this.selectedTxt = this.params.get('selected_txt');
        this.range = this.params.get('range');
        this.sel = this.params.get('sel');
    }

    create() {
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss({ create: true, comment: this.comment, range: this.range, selection: this.sel });
        }, 100)
    }

    dismiss() {
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss({ create: false, share: false });
        }, 100);
    }

}