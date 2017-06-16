import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
@Component({
    selector: 'create_anotation_popup',
    templateUrl: 'create_anotation.html',
})
export class CreateAnotationPopup {
    private selectedTxt: string;

    constructor(public params: NavParams, public viewCtrl: ViewController) {
        this.selectedTxt = this.params.get('selected_txt');
    }

    done() {
        this.viewCtrl.dismiss('done');
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    presentTopInterestsModal() {
        this.viewCtrl.dismiss();
    }

}