import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Follows } from './follows';

@NgModule({
  declarations: [
    // Follows,
  ],
  imports: [
    IonicPageModule.forChild(Follows)
  ],
  exports: [
    // Follows
  ]
})
export class FollowsModule { }
