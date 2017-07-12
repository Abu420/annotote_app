import { Component, Input, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'dot-navigation',
    templateUrl: 'dot-navigation.html',
})
export class DotNavigation implements OnInit {
    @Input() un_active_dots: Number;
    private un_active_dots_array: any;

    ngOnInit(): void {
        this.un_active_dots_array = [];
        for (let i = 0; i < this.un_active_dots; i++) {
            this.un_active_dots_array.push(i);
        }
    }

    constructor(public navCtrl: NavController) {
    }

    remove_page(dot) {
        console.log(dot);
        console.log(this.navCtrl.getViews());
        this.navCtrl.remove(1, 1);
    }


}