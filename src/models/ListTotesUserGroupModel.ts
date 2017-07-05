import {ChatMessage} from "./ChatMessage";
import {User} from "./user";
/**
 * Created by nomantufail on 30/05/2017.
 */
export class ListTotesUserGroupModel{
  public users:Array<User> = [];
  public messages:Array<ChatMessage> = [];
  public constructor(users, messages){
    this.users = users;
    this.messages = messages;
  }
}
