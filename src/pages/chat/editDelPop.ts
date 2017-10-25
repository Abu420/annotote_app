import { ViewController, NavParams } from "ionic-angular";
import { Component } from "@angular/core";
import { AuthenticationService } from "../../services/auth.service";

@Component({
    template: `
      <ion-list>
        <ion-list-header text-center>Options</ion-list-header>
        <button ion-item (click)="close('edit')" *ngIf="message.senderId == user.id" detail-none text-center>Edit</button>
        <button ion-item (click)="close('delete')" *ngIf="message.senderId == user.id" detail-none text-center>Delete</button>
        <button ion-item (click)="close('share')" detail-none text-center>Share</button>
      </ion-list>
    `
})
export class EditDeleteMessage {
    public message;
    public user;
    constructor(public viewCtrl: ViewController,
        params: NavParams,
        authService: AuthenticationService) {
        this.message = params.get('message');
        this.user = authService.getUser();
    }

    close(choice) {
        this.viewCtrl.dismiss({ choice: choice });
    }
}
