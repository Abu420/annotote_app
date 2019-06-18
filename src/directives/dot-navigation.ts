import { Component, Input, OnInit } from '@angular/core';
import { NavController, Events, ViewController } from 'ionic-angular';
import { AuthenticationService } from "../services/auth.service";
import { AnototeEditor } from '../pages/anotote-editor/anotote-editor';
import { AnototeList } from '../pages/anotote-list/anotote-list';

@Component({
    selector: 'dot-navigation',
    templateUrl: 'dot-navigation.html',
})
export class DotNavigation {
    @Input('active') activePosition: number;
    private un_active_dots_array: any = [];

    constructor(public navCtrl: NavController,
        public current: ViewController,
        public dotsProvider: AuthenticationService) {
        this.un_active_dots_array = dotsProvider.dots_to_show;
    }

    remove_current_page() {
        this.navCtrl.pop();
    }

    remove_page(dot) {
        if (dot == 1)
            this.navCtrl.popTo(this.navCtrl.getByIndex(this.un_active_dots_array.length - 1));
        else if (dot == 0)
            this.navCtrl.popTo(this.navCtrl.getByIndex(this.un_active_dots_array.length - 2));
    }

    go_to(index) {
        if (this.activePosition < index) {
            if (this.un_active_dots_array[index].name == 'AnototeEditor') {
                if (this.current.name == 'AnototeList')
                    this.navCtrl.push(AnototeEditor, { ANOTOTE: this.dotsProvider.stateForDots.tote, FROM: this.dotsProvider.stateForDots.from, WHICH_STREAM: this.dotsProvider.stateForDots.which, HIGHLIGHT_RECEIVED: this.dotsProvider.stateForDots.received, actual_stream: this.dotsProvider.stateForDots.actual });
                else
                    this.navCtrl.push(AnototeList, { color: this.dotsProvider.stateForDots.which, dots: 'dots' })
            } else {
                this.navCtrl.push(AnototeList, { color: this.dotsProvider.stateForDots.which, which: 'dots' })
            }
            // this.navCtrl.push(index);
        } else if (this.activePosition > index)
            this.navCtrl.popTo(index);
    }


}