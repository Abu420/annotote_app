import {ListTotesUserToteModel} from "./ListTotesUserToteModel";
import {ListTotesUserGroupModel} from "./ListTotesUserGroupModel";
/**
 * Created by nomantufail on 30/05/2017.
 */
export class ListTotesModel{
  public type:number = 1;
  public userTote:ListTotesUserToteModel = null;
  public userGroup:ListTotesUserGroupModel = null;
  public constructor(){

  }
}
