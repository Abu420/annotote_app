import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AnototeEditor } from './anotote-editor';

@NgModule({
  declarations: [
    AnototeEditor,
  ],
  imports: [
    IonicPageModule.forChild(AnototeEditor),
  ],
  exports: [
    AnototeEditor
  ]
})
export class AnototeEditorModule {}
