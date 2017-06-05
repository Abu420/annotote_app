import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Platform, AlertController, LoadingController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Injectable()
export class UtilityMethods {

    private loading: any;

    constructor(private alertCtrl: AlertController, public platform: Platform, private iab: InAppBrowser, public loadingCtrl: LoadingController) {
        this.platform = platform;
    }

    /**
     * Overall Console Method
     */

    console(msg) {
        console.log(msg);
    }

    /**
     * Show Loader for Async Tasks
     */
    show_loader(msg) {
        this.loading = this.loadingCtrl.create({
            content: msg
        });

        this.loading.present();
    }

    /**
     * Hide currently active loader
     */
    hide_loader() {
        this.loading.dismiss();
    }


    /**
     * Message alert to show just alert message without any callback etc
     */
    message_alert(title, msg) {
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: msg,
            buttons: ['OK']
        });
        alert.present();
    }

    /**
     * 
     */
    message_alert_with_callback(title, msg, callback) {
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: msg,
            buttons: [{
                text: 'OK',
                handler: () => {
                    callback();
                }
            }]
        });
        alert.present();
    }

    /**
     * Launch a url in browser outside of the App
     */

    launch(url) {
        this.platform.ready().then(() => {
            const browser = this.iab.create(url, '_system');
            browser.show();
        });
    }

    /**
     * Validate Email
     */
    validate_email(email) {
        var format = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
        return (email.match(format));
    }

}