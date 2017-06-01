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
    this.secondUser = new User(3, 'bilal', 'akmal', 'bilal@gmail.com', null);
    this.loggedInUser = new User(2, 'noman', 'tufail', 'noman@gmail.com', null);
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
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

  public sendMessage() {
    if (this.textMessage != "") {
      this.socket.emit('send_message', this.textMessage, this.loggedInUser.id, this.secondUser.id);
      this.textMessage = "";
    }
  }

  /**
  * View LifeCycle Events
  */

  ionViewDidLoad() { }

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
