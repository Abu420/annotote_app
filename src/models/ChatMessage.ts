/**
 * Created by nomantufail on 24/05/2017.
 */
export class ChatMessage {
  public id: number;
  public sender:string;
  public time:any;
  public message:string;

  constructor(id:any, sender:string, time:string, message:string) {
    this.id = id;
    this.sender = sender;
    this.time = time;
    this.message = message;
  }
}
