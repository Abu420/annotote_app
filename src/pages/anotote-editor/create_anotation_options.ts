import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
@Component({
    selector: 'create_anotation_popup',
    templateUrl: 'create_anotation_options.html',
})
export class CreateAnotationOptionsPopup {
    private selectedTxt: string;

    constructor(public params: NavParams, public viewCtrl: ViewController) {
        this.selectedTxt = this.params.get('selected_txt');
        console.log(this.selectedTxt);
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    presentTopInterestsModal() {
        this.viewCtrl.dismiss();
    }

}