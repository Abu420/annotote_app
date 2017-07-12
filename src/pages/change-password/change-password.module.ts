import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChangePassword } from './change-password';

@NgModule({
  declarations: [
    // ForgotPassword,
  ],
  imports: [
    IonicPageModule.forChild(ChangePassword),
  ],
  exports: [
    // ForgotPassword
  ]
})
export class ChangePasswordModule {}
