import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AnototeDetail } from './anotote-detail';
import { AnototeOptions } from "./tote_options";
import { ViewOptions } from "./view_options";

@NgModule({
  declarations: [
    // AnototeDetail,
    AnototeOptions,
    ViewOptions
  ],
  imports: [
    IonicPageModule.forChild(AnototeDetail),
  ],
  exports: [
    // AnototeDetail
  ]
})
export class AnototeDetailModule {}
