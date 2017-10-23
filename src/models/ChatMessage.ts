import { DatetimeService } from "../services/datetime.service";
/**
 * Created by nomantufail on 24/05/2017.
 */
export class ChatMessage {
  public id: number;
  public sender: string = '';
  public createdAt: string;
  public text: string;
  public read: number;
  public senderId: number;
  public groupId: number;
  //private datetimeService: DatetimeService;
  constructor(id: any, senderId: number, time: string, text: string, read: number, groupId: number) {
    // this.datetimeService = new DatetimeService();
    this.id = id;
    this.createdAt = time;
    this.text = text;
    this.senderId = senderId;
    this.read = read;
    this.groupId = groupId;
  }
}
