import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Platform } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Injectable()
export class UtilityMethods {

    constructor(public platform: Platform, private iab: InAppBrowser) {
        this.platform = platform;
    }

    console(msg) {
        console.log(msg);
    }

    launch(url) {
        this.platform.ready().then(() => {
            const browser = this.iab.create(url, '_system');
            browser.show();
        });
    }

}