export class Group {
    chat_group: Array<any> = [];
    chat_tag: Array<any> = [];
    chat_vote: Array<any> = [];
    created_at: number;
    id: number;
    messages: Array<any> = [];
    name: string;
    rating: number;
    updated_at: number;
    user_id: number;
    //Variables for manipulation of anotote app
    isChat: boolean;
    is_tote: boolean;
    constructor() { }
}