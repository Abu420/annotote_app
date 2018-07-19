
import { User } from "./user";
/**
 * Created by nomantufail on 30/05/2017.
 */

export class ListTotesModel {
  public id: number = 0;
  public type: number = 1;
  public userToteId: number = 0;
  public chatGroupId: number = 0;
  public userAnnotote: any = null;
  public highlights: Array<any> = [];
  public followers: Array<User> = [];
  public selected_follower_name: string = '';
  public chatGroup: any = null;
  public createdAt: string = '';
  public updatedAt: string = '';
  public active: boolean = false;
  public activeParty: number = 1; //1:me, 2:follows, 3:top
  public checked: boolean;
  public isTop: number = 0;
  public isMe: number = 0;
  public topUserToteId: number = 0
  public spinner_for_active: boolean = false;
  public constructor(id, type, userToteId, chatGroupId, userAnnotote, chatGroup, createdAt, updatedAt) {
    //this.datetimeService = new DatetimeService();
    this.id = id;
    this.type = type;
    this.userToteId = userToteId;
    this.chatGroupId = chatGroupId;
    this.userAnnotote = userAnnotote;
    this.chatGroup = chatGroup;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.checked = false;
    if (this.userAnnotote != null) {
      this.setHighlights(this.userAnnotote.annototeHeighlights);
      this.setFollowers(this.userAnnotote.anototeDetail.follows);
      this.isTop = this.userAnnotote.anototeDetail.isTop
      this.isMe = this.userAnnotote.anototeDetail.isMe
      if (this.isTop == 1)
        this.topUserToteId = this.userAnnotote.anototeDetail.topUserToteId;
    }
    if (this.chatGroup != null) {
      if (this.chatGroup.messagesUser)
        this.chatGroup.messagesUser.reverse();
    }
  }

  public setHighlights(highlights: Array<any>) {
    this.highlights = Object.assign(highlights);
  }

  public setFollowers(followers: Array<User>) {
    this.followers = followers;
    if (this.followers.length > 0) {
      this.setFirstFollowerName(this.followers[0].firstName);
    }
  }
  public setFirstFollowerName(name: string) {
    this.selected_follower_name = name;
  }

  public setFollowerHighlights(highlights: Array<null>) {
    this.activeParty = 2;
    this.setHighlights(highlights);
  }
}
