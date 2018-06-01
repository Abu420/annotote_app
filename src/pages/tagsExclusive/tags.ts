import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams, ModalController } from 'ionic-angular';
import { SearchService } from '../../services/search.service';
import { UtilityMethods } from '../../services/utility_methods';
import { AuthenticationService } from '../../services/auth.service';
import { StatusBar } from "@ionic-native/status-bar";
import { TagsOptions } from '../anotote-list/tags_options';
import { Keyboard } from '@ionic-native/keyboard';

@Component({
    selector: 'comment_detail_popup',
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
export class TagsExclusive {
    one_selected: any;
    show: boolean = true;
    search_user: boolean;
    no_user_found: boolean;
    nameEntered: string;
    users: any[] = [];
    show_autocomplete: boolean;
    isTagging: boolean;
    nameInputIndex: number;
    tag: any;
    public user;
    private tag_input: string;
    private tags = [];
    private tag_id: number;
    user_is_from_suggestions: boolean = false;


    constructor(public statusbar: StatusBar,
        private utilityMethods: UtilityMethods,
        public authService: AuthenticationService,
        private params: NavParams,
        public modalCtrl: ModalController,
        public viewCtrl: ViewController,
        public key: Keyboard,
        public searchService: SearchService) {
        if (utilityMethods.whichPlatform() == 'ios')
            statusbar.hide();
        this.key.disableScroll(false);
        this.tag_input = params.get('tag');
        this.user = this.authService.getUser();
        this.tag = params.get('tag');
        if (this.tag == '@')
            this.tag_id = 2;
        else
            this.tag_id = 3;
        this.isTagging = true;
        this.nameInputIndex = 0;
    }

    saveTags() {
        var hashtags = this.searchTags('#');
        var cashtags = this.searchTags('$');
        var uptags = this.uptags();
        var followtags = this.userTags();

        if (hashtags.length > 0 || cashtags.length > 0 || followtags.length > 0 || uptags) {
            // if (hashtags.length > 0)
            //     for (let hash of hashtags)
            //         // this.add_tag(3, hash);
            // if (cashtags.length > 0)
            //     for (let cash of cashtags)
            //         // this.add_tag(4, cash);
            // if (followtags.length > 0)
            //     for (let user of followtags)
            //         // this.add_tag(2, user);
            // if (uptags.length > 0)
            //     for (let ups of uptags)
            //         this.add_tag(1, ups);

        } else {
            this.utilityMethods.doToast("Please Enter #,$,@ sign before writing tag or paste a url.");
        }
    }

    uptags() {
        var matches = [];
        matches = this.tag_input.match(/\bhttps?:\/\/\S+/gi);
        return matches == null ? [] : matches;
    }

    tag_user() {
        if (this.tag_input[this.tag_input.length - 1] == '@' || this.tag_input[this.tag_input.length - 1] == '#' || this.tag_input[this.tag_input.length - 1] == '$') {
            this.nameInputIndex = this.tag_input.length - 1;
            this.isTagging = true;
            if (this.tag_input[this.tag_input.length - 1] == '@')
                this.tag_id = 2;
            else
                this.tag_id = 3;
        }
        if (this.isTagging) {
            if (this.nameInputIndex > this.tag_input.length - 1) {
                this.show_autocomplete = false;
                this.users = [];
                this.isTagging = false;
                this.nameInputIndex = 0;
                return;
            } else if (this.tag_input[this.nameInputIndex] == '@') {
                this.tag_id = 2;
                this.nameEntered = this.tag_input.substr(this.nameInputIndex + 1);
                if (this.nameEntered.split(' ').length == 1) {
                    var params = {
                        name: this.nameEntered
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
                } else {
                    this.show_autocomplete = false;
                    this.users = [];
                    this.isTagging = false;
                    this.nameInputIndex = 0;
                    return;
                }
            } else {
                this.tag_id = 3;
                var paramz = {
                    value: this.tag_input.substr(this.nameInputIndex + 1),
                    id: this.tag_input[this.nameInputIndex] == '#' ? 3 : 4
                }
                if (paramz.value != '') {
                    this.no_user_found = false;
                    this.show_autocomplete = true;
                    this.search_user = true;
                    this.users = [];
                    this.tags = [];
                    this.searchService.autocomplete_tags(paramz).subscribe((result) => {
                        this.search_user = false;
                        this.tags = result.data.tags;
                        if (this.tags.length == 0) {
                            this.no_user_found = true;
                        }
                    }, (error) => {
                        this.search_user = false;
                        this.show_autocomplete = true;
                        this.no_user_found = false;
                        this.users = [];
                        this.tags = [];
                        if (error.code == -1) {
                            this.utilityMethods.internet_connection_error();
                        }
                    })
                } else {

                }
            }
        }
    }

    selectTag(tag) {
        this.tag_input = this.tag_input.substring(0, this.nameInputIndex + 1) + tag.tag + ' ';
        this.isTagging = false;
        this.nameInputIndex = null;
        this.show_autocomplete = false;
        // this.tag_input += tag.tag;
        // this.addTag();
    }

    addTag() {
        if (this.tag_id == 2 && this.user_is_from_suggestions == false) {
            this.utilityMethods.doToast("Please select a user from the list.");
            return;
        }
        this.statusbar.show();
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss({ tag: this.tag_input });
        })
    }

    userTags() {
        var matches = [];
        var finalized = [];
        matches = this.tag_input.split('`')
        for (let match of matches) {
            if (match[0] == '@') {
                match = match.replace('@', '');
                finalized.push(match);
            }
        }
        return finalized;
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
        // this.tag_input = this.tag_input.replace('@' + this.nameEntered, "`@" + user.firstName + "`")
        // this.tag_input = '@' + user.firstName;
        this.show_autocomplete = false;
        this.users = [];
        this.tag_input = this.tag_input.substring(0, this.nameInputIndex) + '`@' + user.firstName + '` ';
        this.user_is_from_suggestions = true;
        this.isTagging = false;
        this.nameInputIndex = null;
        // this.addTag();
    }

    dismiss() {
        this.statusbar.show();
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss();
        })
    }

}