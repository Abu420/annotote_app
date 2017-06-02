import {ListTotesUserToteModel} from "./ListTotesUserToteModel";
import {ListTotesUserGroupModel} from "./ListTotesUserGroupModel";
/**
 * Created by nomantufail on 30/05/2017.
 */
export class ListTotesModel{
  public id:number = 0;
  public type:number = 1;
  public userToteId:number = 0;
  public chatGroupId:number = 0;
  public userAnnotote:any = null;
  public highlights:Array<any> = [];
  public chatGroup:any = null;
  public createdAt:string = '';
  public updatedAt:string = '';
  public active:boolean = false;
  public activeParty:number = 1; //1:me, 2:follows, 3:top
  public constructor(id, type, userToteId, chatGroupId, userAnnotote, chatGroup, createdAt, updatedAt){
    this.id = id;
    this.type = type;
    this.userToteId = userToteId;
    this.chatGroupId = chatGroupId;
    this.userAnnotote = userAnnotote;
    this.chatGroup = chatGroup;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
