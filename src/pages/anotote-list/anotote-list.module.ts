import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AnototeList } from './anotote-list';

@NgModule({
  declarations: [
    // AnototeList,
  ],
  imports: [
    IonicPageModule.forChild(AnototeList),
  ],
  exports: [
    // AnototeList
  ]
})
export class AnototeListModule {}
