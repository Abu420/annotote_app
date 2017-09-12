import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
@Component({
    selector: 'create_anotation_popup',
    templateUrl: 'create_anotation.html',
})
export class CreateAnotationPopup {
    private selectedTxt: string;
    private comment: string;
    private range: string;
    private sel: string;

    constructor(public params: NavParams, public viewCtrl: ViewController) {
        this.selectedTxt = this.params.get('selected_txt');
        this.range = this.params.get('range');
        this.sel = this.params.get('sel');
    }

    value_updating_comment(value) {
        this.comment = value;
    }

    share() {
        this.viewCtrl.dismiss({ share: true });
    }

    done() {
        this.viewCtrl.dismiss({ create: true, comment: this.comment, range: this.range, selection: this.sel });
    }

    dismiss() {
        this.viewCtrl.dismiss({ create: false, share: false });
    }

}