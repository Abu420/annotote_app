import { Injectable } from "@angular/core";

@Injectable()
export class Streams {
    public me_anototes: any = [];
    public me_page_no: number = 1;
    public me_first_load = false;
    public follows_anototes: any = [];
    public follows_page_no: number = 1;
    public follow_first_load = false;
    public top_anototes: any = [];
    public top_page_no = 1;
    public top_first_load = false;

    constructor() {

    }

    clear() {
        this.me_anototes = [];
        this.me_page_no = 1;
        this.me_first_load = false;
        this.follows_anototes = [];
        this.follows_page_no = 1;
        this.follow_first_load = false;
        this.top_anototes = [];
        this.top_page_no = 1;
        this.top_first_load = false;
    }
}