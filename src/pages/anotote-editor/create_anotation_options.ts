import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
import { StatusBar } from "@ionic-native/status-bar";
@Component({
    selector: 'create_anotation_popup',
    templateUrl: 'create_anotation_options.html',
})
export class CreateAnotationOptionsPopup {
    private selectedTxt: string;

    constructor(public params: NavParams, public viewCtrl: ViewController, public statusbar: StatusBar) {
        statusbar.hide();
        this.selectedTxt = this.params.get('selected_txt');
    }

    dismiss() {
        this.statusbar.show();
        this.viewCtrl.dismiss();
    }

    presentTopInterestsModal() {
        this.statusbar.show();
        this.viewCtrl.dismiss();
    }

}