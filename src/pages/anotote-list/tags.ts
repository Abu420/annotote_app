import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
import { SearchService } from '../../services/search.service';
import { UtilityMethods } from '../../services/utility_methods';
@Component({
    selector: 'tags_popup',
    templateUrl: 'tags.html',
})
export class TagsPopUp {
    private tag_input: string;
    private tags: any;
    private user_tote_id: string;


    constructor(private utilityMethods: UtilityMethods, private params: NavParams, public viewCtrl: ViewController, public searchService: SearchService) {
        this.tag_input = "";
        this.tags = params.get('tags');
        this.user_tote_id = params.get('user_tote_id');
    }

    add_tag() {
        var current_time = this.utilityMethods.get_php_wala_time();
        this.searchService.add_tag_to_anotote({ user_tote_id: this.user_tote_id, tag_text: this.tag_input, created_at: current_time })
            .subscribe((res) => {
                console.log(res);
            }, (err) => {
                console.log(err);
            });
    }

    value_updating_tag(value) {
        this.tag_input = value;
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}