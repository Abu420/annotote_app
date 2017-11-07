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

    add_tag(type, tag) {
        if (this.anotation_or_anotote) {
            var current_time = this.utilityMethods.get_php_wala_time();
            var paramsObj = {
                user_tote_id: this.user_tote_id,
                tag_text: tag,
                created_at: current_time,
                tag_id: type
            }
            if (type == 2 && this.one_selected != null)
                paramsObj['user_id'] = this.one_selected.id;
            var toast = this.utilityMethods.doLoadingToast('Tagging');
            this.searchService.add_tag_to_anotote(paramsObj)
                .subscribe((res) => {
                    toast.dismiss();
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
                tag_id: type,
                annotation_id: this.annotation_id,
                text: tag,
                created_at: this.utilityMethods.get_php_wala_time(),
            }
            if (type == 2 && this.one_selected != null)
                params['user_id'] = this.one_selected.id;
            else if (type == 2 && this.one_selected == null) {
                this.utilityMethods.doToast("Please select a user to tag.");
                return;
            }
            var toast = this.utilityMethods.doLoadingToast('Tagging');
            this.searchService.add_tag_to_anotation(params).subscribe((result) => {
                toast.dismiss();
                this.tags.push(result.data.annotation_tag);
                this.tag_input = '';
                if (this.tags.length > 0)
                    this.no_tags_found = false;
            }, (error) => {
                toast.dismiss();
                if (error.code == -1) {
                    this.utilityMethods.internet_connection_error();
                } else {
                    this.utilityMethods.doToast("Couldn't add tag to annotation.");
                }
            })
        }
    }

    saveTags() {
        var hashtags = this.searchTags('#');
        var cashtags = this.searchTags('$');
        var uptags = this.utilityMethods.isWEBURL(this.tag_input);
        var followtags = this.searchTags('@');
        if (hashtags.length > 0 || cashtags.length > 0 || followtags.length > 0 || uptags) {
            if (hashtags.length > 0)
                this.add_tag(3, hashtags[0]);
            else if (cashtags.length > 0)
                this.add_tag(4, cashtags[0]);
            else if (followtags.length > 0)
                this.add_tag(2, followtags[0]);
            else if (uptags)
                this.add_tag(1, this.tag_input);

        } else {
            this.utilityMethods.doToast("Please Enter #,$,@ sign before writing tag or paste a url.");
        }
    }

    tag_user() {
        if (this.tag_input[0] == '@') {
            if (this.tag_input == '') {
                this.show_autocomplete = false;
                this.users = [];
                return;
            }
            var params = {
                name: this.tag_input.replace(/[^\w\s]/gi, "")
            }
            if (params.name != '') {
                this.no_user_found = false;
                this.show_autocomplete = true;
                this.search_user = true;
                this.users = [];
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
                    this.users = [];
                    if (error.code == -1) {
                        this.utilityMethods.internet_connection_error();
                    }
                })
            }
        }
    }

    searchTags(tag) {
        var tags = [];
        var check = false;
        if (this.tag_input[0] == tag) {
            check = true;
        }
        var tagsincomment = this.tag_input.split(tag);
        var i = check ? 0 : 1;
        for (var i = 1; i < tagsincomment.length; i++) {
            var temp = tagsincomment[i].split(' ');
            temp[0] = temp[0].replace(/[^\w\s]/gi, "")
            tags.push(temp[0]);
        }
        return tags;
    }

    selected_user(user) {
        this.tag_input = '@' + user.firstName;
        this.show_autocomplete = false;
        this.users = [];
        this.one_selected = user;
        this.saveTags();
    }

    dismiss() {
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss();
        })
    }

}