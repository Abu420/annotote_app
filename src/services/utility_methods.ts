import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Network } from '@ionic-native/network';
//import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Platform, AlertController, LoadingController, ToastController, ActionSheetController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Injectable()
export class UtilityMethods {

    private loading: any;
    private onDevice: boolean;

    constructor(private actionSheet: ActionSheetController, private socialSharing: SocialSharing, private network: Network, private alertCtrl: AlertController, public platform: Platform, private iab: InAppBrowser, public loadingCtrl: LoadingController, private toastCtrl: ToastController) {
        this.platform = platform;
    }

    /**
     * Overall Console Method
     */

    console(msg) {
        console.log(msg);
    }

    /**
     * Native Share
     */
    share_content_native(message, subject, file, url) {
        console.log(message);
        this.socialSharing.share(message, subject, file, url).then((res) => {
            // Sharing via email is possible
        }).catch(() => {
            this.doToast("Couldn't open native sheet.");
        });
    }

    share_via_facebook(msg, image, url) {
        this.socialSharing.shareViaFacebook(msg, image, url).then((res) => {
        }).catch(() => {
            this.doToast("Couldn't open facebook.");
        });
    }

    share_via_twitter(msg, image, url) {
        this.socialSharing.shareViaTwitter(msg, image, url).then((res) => {
        }).catch((err) => {
            this.doToast("Couldn't open twitter.");
        });
    }

    share_via_email(msg, subject, to) {
        this.socialSharing.shareViaEmail(msg, subject, to).then((res) => {
        }).catch(() => {
            this.doToast("Couldn't open email.");
        });
    }

    /**
     * Show Loader for Async Tasks
     */
    public show_loader(msg, backdrop: boolean = true) {
        this.loading = this.loadingCtrl.create({
            spinner: 'bubbles',
            content: msg,
            showBackdrop: backdrop
        });

        this.loading.present();
    }

    /**
     * Hide currently active loader
     */
    hide_loader() {
        if (this.loading)
            this.loading.dismiss();
    }
    /**
     * Toast from ionic not through plugin
     */
    doToast(msg: string) {
        let toast = this.toastCtrl.create({
            message: msg,
            duration: 2500,
            position: 'bottom',
            cssClass: 'bottom_snakbar'
        });

        toast.onDidDismiss(() => {
            // console.log('Dismissed toast');
        });

        toast.present();
    }

    /**
     * Validate URL
     */
    isWEBURL(url) {
        var re_weburl = new RegExp(
            "^" +
            // protocol identifier
            "(?:(?:https?|ftp)://)" +
            // user:pass authentication
            "(?:\\S+(?::\\S*)?@)?" +
            "(?:" +
            // IP address exclusion
            // private & local networks
            "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
            "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
            "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
            // IP address dotted notation octets
            // excludes loopback network 0.0.0.0
            // excludes reserved space >= 224.0.0.0
            // excludes network & broacast addresses
            // (first & last IP address of each class)
            "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
            "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
            "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
            "|" +
            // host name
            "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
            // domain name
            "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
            // TLD identifier
            "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
            // TLD may end with dot
            "\\.?" +
            ")" +
            // port number
            "(?::\\d{2,5})?" +
            // resource path
            "(?:[/?#]\\S*)?" +
            "$", "i"
        );
        return re_weburl.test(url);
    }

    /**
     * Get PHP Wala tame
     */
    get_php_wala_time() {
        var current_time = (new Date()).getTime() / 1000;
        current_time = Math.round(current_time);
        return current_time;
    }

    /**
     * Time for date filter
     */
    get_time(date) {
        var current_time = (new Date(date)).getTime() / 1000;
        current_time = Math.round(current_time);
        return current_time;
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

    prompt(message, callback) {
        let alert = this.alertCtrl.create({
            title: 'Edit Message',
            inputs: [
                {
                    name: 'Message',
                    placeholder: 'Message',
                    value: message
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: data => {
                    }
                },
                {
                    text: 'Save',
                    handler: (data) => {
                        callback(data);
                    }
                }
            ]
        });
        alert.present();
    }

    comment(message, callback) {
        let alert = this.alertCtrl.create({
            title: 'Comment',
            inputs: [
                {
                    name: 'comment',
                    placeholder: 'Place your comment here',
                    value: message
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: data => {
                    }
                },
                {
                    text: 'Save',
                    handler: (data) => {
                        callback(data);
                    }
                }
            ]
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

    confirmation_message(title, msg, callback) {
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: msg,
            buttons: [{
                text: 'OK',
                handler: () => {
                    callback();
                }
            }, {
                text: 'Cancel',
                role: 'cancel',
                handler: () => { }
            }]
        });
        alert.present();
    }

    tags_or_comment(callback) {
        let alert = this.alertCtrl.create({
            title: 'Please choose',
            buttons: [{
                text: 'Add tags',
                handler: () => {
                    callback('tags');
                }
            }, {
                text: 'Comment',
                handler: () => {
                    callback('comment');
                }
            }]
        });
        alert.present();
    }

    reorder_or_edit(callback) {
        let alert = this.alertCtrl.create({
            title: "Preference",
            subTitle: "Do you want to edit annotation or reorder it.",
            buttons: [{
                text: 'Reorder',
                handler: () => {
                    callback('reorder');
                }
            }, {
                text: 'Edit',
                handler: () => {
                    callback('edit');
                }
            }]
        });
        alert.present();
    }

    /**
     * Internet Connection Error
     */
    internet_connection_error() {
        this.doToast("Please check your internet connection and try again.");
    }

    /**
     * Internet Connection Check
     */
    isOffline(): boolean {
        if (this.onDevice && this.network.type) {
            return this.network.type === "none";
        } else {
            return !navigator.onLine;
        }
    }

    /**
     * Launch a url in browser outside of the App
     */

    launch(url) {
        window.open(url, '_system')
    }

    /**
     * Validate Email
     */
    validate_email(email) {
        var format = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
        return (email.match(format));
    }

}
