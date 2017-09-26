import { Injectable } from "@angular/core";

@Injectable()
export class Streams {
    public me_anototes: any = [];
    public me_page_no: number = 1;
    public me_first_load = false;
    public follows_anototes: any = [];
    public follows_page_no: number = 1;

    constructor() {

    }
}