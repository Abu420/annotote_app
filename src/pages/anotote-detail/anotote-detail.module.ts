import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AnototeDetail } from './anotote-detail';

@NgModule({
  declarations: [
    AnototeDetail,
  ],
  imports: [
    IonicPageModule.forChild(AnototeDetail),
  ],
  exports: [
    AnototeDetail
  ]
})
export class AnototeDetailModule {}
