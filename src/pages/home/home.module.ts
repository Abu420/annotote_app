import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Home } from './home';
//import { AnototeContentOptions } from "./content_options";

@NgModule({
  declarations: [
    // Home,
    // AnototeContentOptions
  ],
  imports: [
    IonicPageModule.forChild(Home),
  ],
  exports: [
    // Home
  ]
})
export class HomeModule {}
