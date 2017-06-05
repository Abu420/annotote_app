import {DatetimeService} from "../services/datetime.service";
/**
 * Created by nomantufail on 24/05/2017.
 */
export class ChatMessage {
  public id: number;
  public sender:string;
  public time:any;
  public message:string;
  private datetimeService:DatetimeService;
  constructor(id:any, sender:string, time:string, message:string) {
    this.datetimeService = new DatetimeService();
    this.id = id;
    this.sender = sender;
    this.time = this.datetimeService.convertTimeFormat(time);
    this.message = message;
  }
}
