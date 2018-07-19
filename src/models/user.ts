import { Group } from "./ChatGroup";

export class User {
    public id: number;
    public firstName: string = '';
    public lastName: string = '';
    public full_name: string = '';
    public email: string = '';
    public password: string = '';
    public access_token: string = '';
    public createdAt: string = '';
    public description: any = '';
    public photo: string = '';
    public platform: string = '';
    public platformId: string = '';
    public rememberToken: string = '';
    public updatedAt: string = '';
    public tutorial_status: string = '';
    public verified: string = '';
    public userTags = [];
    public chats: Array<Group> = [];
    //manipulation variables
    public isFollowed: number;

    constructor() { }
}
