import { ViewController, NavParams } from "ionic-angular";
import { Component, trigger, transition, style, animate } from "@angular/core";
import { AuthenticationService } from "../../services/auth.service";
import { AnototeService } from "../../services/anotote.service";
import { UtilityMethods } from "../../services/utility_methods";

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
    constructor(public viewCtrl: ViewController,
        params: NavParams,
        authService: AuthenticationService,
        public anototeService: AnototeService,
        public utilityMethods: UtilityMethods) {
        this.message = params.get('message');
        this.user = authService.getUser();
        this.stream = params.get('contains');
        this.chatormsg = params.get('chatToteOpts');
        if (params.get('tote')) {
            this.tote = params.get('tote')
        }
    }

    close(choice) {
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss({ choice: choice });
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

    determine_groupUser_as_admin(): boolean {
        for (let user of this.tote) {
            if (user.groupAdmin == 1 && user.user.id == this.user.id)
                return true;
        }
        return false;
    }
}
