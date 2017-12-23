import { Component, Input, OnInit } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { AuthenticationService } from "../services/auth.service";

@Component({
    selector: 'dot-navigation',
    templateUrl: 'dot-navigation.html',
})
export class DotNavigation implements OnInit {
    @Input() unactivedots: number;
    private un_active_dots_array: any = [];

    ngOnInit(): void {
        // var that = this;
        // setTimeout(function () {
        //     // that.un_active_dots_array = [];

        //     // for (let i = 0; i < that.navCtrl.getActive().index; i++) {
        //     //     if (i < 3)
        //     //         that.un_active_dots_array.push(i);
        //     // }
        //     // if (that.navCtrl.getPrevious().isOverlay) {
        //     //     if (that.un_active_dots_array.length > 1) {
        //     //         that.un_active_dots_array.pop();
        //     //     }
        //     // }
        // }, 500);
    }

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