import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the AnototeEditor page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-anotote-editor',
  templateUrl: 'anotote-editor.html',
})
export class AnototeEditor {

  public text = "NYT website down after cyber attack on domain registrar, Melbourne IT. The hacking was just the latest of a major media organization, with The Financial Times and The Washington Post also having their operations disrupted within the last few months. It was also the second time this month that the Web site of The New York Times was unavailable for several hours. Marc Frons, chief information officer for The New York Times Company, issued a statement at 4:20 p.m. on Tuesday warning employees that the disruption — which appeared to be affecting the Web site well into the evening — was “the result of a malicious external attack.” He advised employees to “be careful when sending e-mail communications until this situation is resolved.” In an interview, Mr. Frons said the attack was carried out by a group known as “the Syrian Electronic"; 
   
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  popView(){
     this.navCtrl.pop();
   }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AnototeEditor');
  }

}
