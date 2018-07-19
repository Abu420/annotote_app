import { UserAnotote } from "./UserAnotote";

export class Tote {
    created_at: number;
    html_class: any;
    id: number;
    isTop: number;
    link: string;
    local_link: string;
    photo: string;
    source: string;
    title: string;
    topUserToteId: number;
    updated_at: number;
    user_annotote: Array<UserAnotote> = [];
    //Variables for manipulation in anotote app
    active_tab: string = '';
    is_tote: boolean = true;
    selected_follower_anotote: UserAnotote;
    constructor() {
    }
}