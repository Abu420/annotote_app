import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';
@Component({
  selector: 'top_options',
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
  templateUrl: 'top_options.html',
})
export class TopOptions {
  public show: boolean = true;
  constructor(public params: NavParams, public viewCtrl: ViewController) {
  }

  dismiss() {
    this.show = false;
    setTimeout(() => {
      let data = { 'foo': 'bar' };
      this.viewCtrl.dismiss(data);
    }, 300)
  }

  presentTopInterestsModal() {
    this.viewCtrl.dismiss('interests');
  }

}