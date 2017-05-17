import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
@Component({
    selector: 'tags_popup',
    templateUrl: 'tags.html',
})
export class TagsPopUp {

    constructor(params: NavParams, public viewCtrl: ViewController) {
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}