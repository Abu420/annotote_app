import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
import { SearchService } from '../../services/search.service';
import { UtilityMethods } from '../../services/utility_methods';
@Component({
    selector: 'tags_popup',
    animations: [
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({ transform: 'translateY(100%)', opacity: 0 }),
                    animate('500ms', style({ transform: 'translateY(0)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'translateY(0)', opacity: 1 }),
                    animate('500ms', style({ transform: 'translateY(100%)', opacity: 0 }))
                ])
            ]
        )],
    templateUrl: 'tags.html',
})
export class TagsPopUp {
    private tag_input: string;
    private tags: any;
    private user_tote_id: string;
    private stream: string;
    private annotation_id;
    private tags_type: any = 2;
    private anotation_or_anotote: boolean;
    private users: any = [];
    private search_user: boolean = false;
    private show_autocomplete: boolean = false;
    private one_selected: any;
    private no_user_found: boolean = false;
    private no_tags_found: boolean = false;
    public show: boolean = true;

    constructor(private utilityMethods: UtilityMethods, private params: NavParams, public viewCtrl: ViewController, public searchService: SearchService) {
        this.tag_input = "";
        this.stream = params.get('whichStream');
        this.tags = params.get('tags');
        if (this.tags.length == 0)
            this.no_tags_found = true;
        this.anotation_or_anotote = params.get('annotote');
        if (this.anotation_or_anotote) {
            this.user_tote_id = params.get('user_tote_id');
        } else {
            this.annotation_id = params.get('annotation_id');
        }
    }

    add_tag() {
        if (this.anotation_or_anotote) {
            var current_time = this.utilityMethods.get_php_wala_time();
            this.utilityMethods.show_loader('');
            this.searchService.add_tag_to_anotote({ user_tote_id: this.user_tote_id, tag_text: this.tag_input, created_at: current_time })
                .subscribe((res) => {
                    this.utilityMethods.hide_loader();
                    this.tags.push(res.data.annotote_tag);
                    this.tag_input = '';
                    if (this.tags.length > 0)
                        this.no_tags_found = false;
                }, (error) => {
                    this.utilityMethods.hide_loader();
                    if (error.code == -1) {
                        this.utilityMethods.internet_connection_error();
                    }
                    else {
                        this.utilityMethods.doToast("Couldn't add tag to annotation.");
                    }
                });
        } else {
            var params = {
                tag_id: parseInt(this.tags_type),
                annotation_id: this.annotation_id,
                text: this.tag_input,
                created_at: this.utilityMethods.get_php_wala_time(),
            }
            if (this.tags_type == 2)
                params['user_id'] = this.one_selected.id;
            this.utilityMethods.show_loader('');
            this.searchService.add_tag_to_anotation(params).subscribe((result) => {
                this.utilityMethods.hide_loader();
                this.tags.push(result.data.annotation_tag);
                this.tag_input = '';
                if (this.tags.length > 0)
                    this.no_tags_found = false;
            }, (error) => {
                this.utilityMethods.hide_loader();
                if (error.code == -1) {
                    this.utilityMethods.internet_connection_error();
                } else {
                    this.utilityMethods.doToast("Couldn't add tag to annotation.");
                }
            })
        }
    }

    tag_user() {
        // if (!this.anotation_or_anotote && this.tags_type == 2) {
        if (this.tag_input == '') {
            this.show_autocomplete = false;
            this.users = [];
            return;
        }
        var params = {
            name: this.tag_input
        }
        this.no_user_found = false;
        this.show_autocomplete = true;
        this.search_user = true;
        this.searchService.autocomplete_users(params).subscribe((result) => {
            this.search_user = false;
            this.users = result.data.users;
            if (this.users.length == 0) {
                this.no_user_found = true;
            }
        }, (error) => {
            this.search_user = false;
            this.show_autocomplete = true;
            this.no_user_found = false;
            if (error.code == -1) {
                this.utilityMethods.internet_connection_error();
            } else {
                this.utilityMethods.doToast("Couldn't update annotation.");
            }
        })
        // }
    }

    selected_user(user) {
        this.tag_input = user.firstName;
        this.show_autocomplete = false;
        this.users = [];
        this.one_selected = user;
    }

    dismiss() {
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss();
        })
    }

}