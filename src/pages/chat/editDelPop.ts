import { ViewController, NavParams } from "ionic-angular";
import { Component, trigger, transition, style, animate } from "@angular/core";
import { AuthenticationService } from "../../services/auth.service";
import { AnototeService } from "../../services/anotote.service";
import { UtilityMethods } from "../../services/utility_methods";
import { Clipboard } from '@ionic-native/clipboard';
import { StatusBar } from "@ionic-native/status-bar";
import { Constants } from "../../services/constants.service";

@Component({
    selector: 'msg_options',
    animations: [
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({ transform: 'translateY(100%)', opacity: 0 }),
                    animate('300ms', style({ transform: 'translateY(0)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'translateY(0)', opacity: 1 }),
                    animate('300ms', style({ transform: 'translateY(100%)', opacity: 0 }))
                ])
            ]
        )
    ],
    templateUrl: 'edit.html',
})
export class EditDeleteMessage {
    public message;
    public user;
    public show: boolean = true;
    public stream;
    public chatormsg: boolean = true;
    public tote = null;
    public toteId = null;
    public tags = [];
    public isNew: boolean = false;
    public privacy: number;
    constructor(public viewCtrl: ViewController,
        params: NavParams,
        public clip: Clipboard,
        authService: AuthenticationService,
        public anototeService: AnototeService,
        public utilityMethods: UtilityMethods,
        public constants: Constants,
        public statusbar: StatusBar) {
        statusbar.hide();
        this.message = params.get('message');
        this.user = authService.getUser();
        this.stream = params.get('contains');
        this.chatormsg = params.get('chatToteOpts');
        if (params.get('tote')) {
            this.tote = params.get('tote')
            this.toteId = params.get('toteId');
            this.tags = params.get('tags');
        }
        if (params.get('isNew')) {
            this.isNew = true;
            this.privacy = params.get('privacy');
            this.toteId = params.get('id');
        }
    }

    close(choice) {
        this.statusbar.show();
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss({ choice: choice, privacy: this.privacy });
        }, 300)
    }

    change_chatTote_privacy(privacy) {
        if (this.determine_groupUser_as_admin()) {
            if (privacy == 'public') {
                if (this.tote[0].privacy != 0) {
                    // this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to change privacy to public?", () => {
                    var params = {
                        group_id: this.tote[0].groupId,
                        privacy: 0
                    }
                    this.anototeService.chat_tote_privacy(params).subscribe((result) => {
                        for (let user of this.tote) {
                            user.privacy = 0;
                        }
                    }, (error) => {
                        if (error.code == -1) {
                            this.utilityMethods.internet_connection_error();
                        }
                    })
                    // })

                } else {
                    this.utilityMethods.doToast("Anotote is already public.");
                    return;
                }
            } else if (privacy == 'private') {
                if (this.tote[0].privacy != 1) {
                    // this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to change privacy to private?", () => {
                    var params = {
                        group_id: this.tote[0].groupId,
                        privacy: 1
                    }
                    this.anototeService.chat_tote_privacy(params).subscribe((result) => {
                        for (let user of this.tote) {
                            user.privacy = 1;
                        }
                    }, (error) => {
                        if (error.code == -1) {
                            this.utilityMethods.internet_connection_error();
                        }
                    })
                    // })
                } else {
                    this.utilityMethods.doToast("Anotote is already private.");
                    return;
                }
            }
        } else {
            this.utilityMethods.doToast("Only admin can change privacy.")
        }
    }

    change_new_tote_privacy(privacy) {
        this.privacy = privacy;
    }

    determine_groupUser_as_admin(): boolean {
        for (let user of this.tote) {
            if (user.groupAdmin == 1 && user.user.id == this.user.id)
                return true;
        }
        return false;
    }

    share(which) {
        var toBeShared: string = this.message.text;
        this.share_sheet(which, toBeShared);
    }

    share_chat(which) {
        var toBeShared: string = this.constants.API_BASEURL + '/chat-history?second_person=' + this.tote[0].user.id + '&first_person=' + this.tote[1].user.id + '&anotote_id=' + this.toteId + '&page=1';
        this.share_sheet(which, toBeShared);
    }


    share_sheet(which, toBeShared) {
        if (which == 'facebook')
            this.utilityMethods.share_via_facebook("Anotote", null, toBeShared);
        else if (which == 'email')
            this.utilityMethods.share_via_email(toBeShared, "Anotote", "");
        else if (which == 'twitter')
            this.utilityMethods.share_via_twitter("Anotote", "", toBeShared);
        else if (which == 'copy') {
            this.clip.copy(toBeShared).then((success) => {
                this.utilityMethods.doToast("Link copied to clipboard");
            }, (error) => {
                this.utilityMethods.doToast("Couldn't copy");
            });
        } else
            this.utilityMethods.share_content_native("Anotote", null, null, toBeShared);
    }
}
