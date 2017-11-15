import { ViewController, NavParams } from "ionic-angular";
import { Component, trigger, transition, style, animate } from "@angular/core";
import { AuthenticationService } from "../../services/auth.service";

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
    constructor(public viewCtrl: ViewController,
        params: NavParams,
        authService: AuthenticationService) {
        this.message = params.get('message');
        this.user = authService.getUser();
    }

    close(choice) {
        this.show = false;
        setTimeout(() => {
            this.viewCtrl.dismiss({ choice: choice });
        }, 300)
    }
}
