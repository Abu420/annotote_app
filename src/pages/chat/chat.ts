import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { ChatService } from "../../services/chat.service";
import { ChatMessage } from "../../models/ChatMessage";
import { User } from "../../models/user";

declare var io: any;

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class Chat {

  /**
   * Variables && Configs
   */
  public reply_box_on: boolean;
  public socket: any;
  public conversation: Array<ChatMessage> = [];
  public textMessage: string = "";
  public secondUser: User = null;
  public loggedInUser: User = null;

  /**
   * Constructor
   */
  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public chatService: ChatService) {
    this.reply_box_on = false;
    this.secondUser = new User(10, 'bilal', 'akmal', 'bilal@gmail.com', null);
    this.loggedInUser = new User(9, 'noman', 'tufail', 'noman@gmail.com', null);
    this.chatService.threadingUser = this.secondUser;
    this.connectionToSocket();
    this.chatService.listenForGlobalMessages();
  }

  public connectionToSocket() {
    this.socket = io(this.chatService.socketUrl);
    this.socket.on('receive_message', (msg: any) => {
      if (msg.receiverId == this.getLoggedInUserId() && msg.senderId == this.secondUser.id) {
        this.conversation.push(new ChatMessage(1, this.secondUser.full_name, "06:00", msg.message));
      }
    });
  }

  public getLoggedInUserId() {
    return this.loggedInUser.id;
  }

  doRefresh(refresher) {
    this.chatService.fetchHistory(this.getLoggedInUserId(),this.secondUser.id).subscribe((data)=>{
      let messages:Array<any> = data.json().data.messages;
      this.mapChatHistory(messages);
      refresher.complete();
    },(error)=>{});
  }

  public sendMessage() {
    if (this.textMessage != "") {
      this.chatService.saveMessage({second_person:this.secondUser.id, message:this.textMessage, created_at:this.chatService.currentUnixTimestamp()}).subscribe((data)=>{
        this.mapChatHistory(data.json().data.messages);
      }, (error)=>{});
      this.socket.emit('send_message', this.textMessage, this.loggedInUser.id, this.secondUser.id, this.chatService.currentTime());
      this.textMessage = "";
    }
  }

  /**
  * View LifeCycle Events
  */

  ionViewDidLoad() {
    this.chatService.fetchHistory(this.getLoggedInUserId(),this.secondUser.id).subscribe((data)=>{
      let messages:Array<any> = data.json().data.messages;
      this.mapChatHistory(messages);
    },(error)=>{});
  }

  mapChatHistory(messages:Array<any>){
    this.conversation = [];
    for (let element of messages) {
      let sender = (parseInt(element.sender_id) == this.getLoggedInUserId())?this.loggedInUser.full_name:this.secondUser.full_name;
      this.conversation.push(new ChatMessage(element.id, sender, element.createdAt, element.text));
    }
  }

  ionViewWillLeave() { }

  /**
  * Methods
  */


  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  show_reply_box() {
    this.reply_box_on = true;
  }

  ionViewDidLeave() {
    this.chatService.threadingUser = null;
  }
}
