import { User } from "./user";

export class UserProfile {
    followers: number;
    follows: number;
    totes: number;
    user: User;

    constructor(respone_user) {
        this.totes = respone_user.annotote_count;
        this.followers = respone_user.followers_count;
        this.follows = respone_user.follows_count;
        this.user = new User();
        this.user.id = respone_user.id;
        this.user.firstName = respone_user.first_name;
        this.user.description = respone_user.description;
        this.user.email = respone_user.email;
        this.user.isFollowed = respone_user.is_following_count;
        this.user.photo = respone_user.photo;
        this.user.tutorial_status = respone_user.tutorial_status;
        this.user.chats = respone_user.chats
    }
}