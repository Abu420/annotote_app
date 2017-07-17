/**
 * Created by Bilal Akmal on 02/06/2017.
 */
import { Injectable } from '@angular/core';
import { User } from "../models/user";
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { Constants } from '../services/constants.service'
import { Http, RequestOptions, Headers } from "@angular/http";

@Injectable()

export class NotificationService {

    /**
     * Variables
     */
    private _notifications: any;
    private _page: number;
    private _unread: number;
    private _loaded_once_flag: boolean;

    public constructor(public http: Http, public constants: Constants, public storage: Storage) {
        this._page = 0;
        this._notifications = [];
        this._unread = 0;
        this._loaded_once_flag = false;
    }

    public clear_data() {
        this._page = 0;
        this._notifications = [];
        this._unread = 0;
    }

    public loaded_once() {
        return this._loaded_once_flag;
    }

    public decrement_notification() {
        if (this._unread > 0)
            this._unread--;
        return this._unread;
    }

    public get_notification_data() {
        return { notifications: this._notifications, unread: this._unread };
    }

    /**
     * Read Notification API
     * type: {GET}
     * params: [notification_id]
     */
    read_notificaton(notification_id) {
        var url = this.constants.API_BASEURL + '/read-notification?notification_id=' + notification_id;
        var response = this.http.get(url).map(res => res.json());
        return response;
    }

    /**
     * Get All User Notifications API
     * type: {GET}
     * params: [user_id], 
     */
    public get_notifications(user_id) {
        var url = this.constants.API_BASEURL + '/get-notifications?user_id=' + user_id + '&page=' + this._page;
        var response = this.http.get(url).map(res => res.json());
        response.subscribe((res) => {
            this._loaded_once_flag = true;
            for (let i = 0; i < res.data.notifications.length; i++) {
                var notif = res.data.notifications[i];
                var current_date = new Date();
                var formated_time = new Date(notif.createdAt * 1000);
                var timeDiff = Math.abs(current_date.getTime() - formated_time.getTime());
                var difference = timeDiff / (1000 * 3600 * 24);
                notif.is_today = difference < 1 ? true : false;
                notif.formated_time = formated_time;
            }
            this._notifications = res.data.notifications;
            this._unread = res.data.unread;
        }, (error) => {
            this._loaded_once_flag = true;
        });
        return response;
    }
}
