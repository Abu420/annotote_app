export class Anotote {
    public id: number;
    public title: string;
    public short_text: string;
    public long_text: string;
    public time: string;
    public type: string;
    public active: boolean;
    constructor(num, tit, shorttxt, longtxt, time, type, active) {
        this.id = num;
        this.title = tit;
        this.long_text = longtxt;
        this.short_text = shorttxt;
        this.time = time;
        this.type = type;
        this.active = active;
    }
}