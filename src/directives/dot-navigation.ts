import { Component, Input, OnInit } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { AuthenticationService } from "../services/auth.service";

@Component({
    selector: 'dot-navigation',
    templateUrl: 'dot-navigation.html',
})
export class DotNavigation {
    @Input() unactivedots: number;
    private un_active_dots_array: any = [];

    constructor(public navCtrl: NavController,
        public dotsProvider: AuthenticationService) {
        this.un_active_dots_array = dotsProvider.dots_to_show;
    }

    remove_current_page() {
        this.navCtrl.pop();
    }

    remove_page(dot) {
        this.navCtrl.popTo(this.navCtrl.getByIndex(this.un_active_dots_array.indexOf(dot)));
    }


}