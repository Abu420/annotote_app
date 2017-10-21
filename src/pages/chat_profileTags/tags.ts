import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
import { SearchService } from '../../services/search.service';
import { UtilityMethods } from '../../services/utility_methods';
import { AuthenticationService } from '../../services/auth.service';
@Component({
    selector: 'tags_chat_profile',
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
export class TagsForChat {
    public show: boolean = true;
    public from;
    public isMe: boolean;
    public tags = [];
    public no_tags_found: boolean = false;
    public tag_input: string = '';
    public user;

    constructor(private utilityMethods: UtilityMethods, public authService: AuthenticationService, private params: NavParams, public viewCtrl: ViewController, public searchService: SearchService) {
        this.user = this.authService.getUser();
        this.from = params.get('profile');
        this.isMe = params.get('isMe');
        this.tags = params.get('tags');
        if (this.tags.length == 0) {
            this.no_tags_found = true;
        }
    }

    addTags() {
        var current_time = this.utilityMethods.get_php_wala_time();
        this.utilityMethods.show_loader('');
        this.searchService.add_tags_to_profile({ user_id: this.user.id, tag_text: this.tag_input, created_at: current_time })
            .subscribe((res) => {
                this.utilityMethods.hide_loader();
                this.tags.push(res.data.user_tag);
                this.tag_input = '';
                if (this.tags.length > 0)
                    this.no_tags_found = false;
            }, (error) => {
                this.utilityMethods.hide_loader();
                if (error.code == -1) {
                    this.utilityMethods.internet_connection_error();
                } else {
                    this.utilityMethods.doToast("Couldn't add tag.");
                }
            });
    }

    dismiss() {
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss();
        })
    }

}