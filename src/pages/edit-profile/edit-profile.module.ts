import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditProfile } from './edit-profile';

@NgModule({
  declarations: [
    // ForgotPassword,
  ],
  imports: [
    IonicPageModule.forChild(EditProfile),
  ],
  exports: [
    // ForgotPassword
  ]
})
export class EditProfileModule { }
