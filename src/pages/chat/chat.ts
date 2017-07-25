import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams, Content } from 'ionic-angular';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { ChatService } from "../../services/chat.service";
import { ChatMessage } from "../../models/ChatMessage";
import { User } from "../../models/user";
import { AuthenticationService } from "../../services/auth.service";

declare var io: any;

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
  queries: {
    content: new ViewChild('content')
  }
})

export class Chat {
  @ViewChild(Content) content: Content;
  /**
   * Variables && Configs
   */
  public reply_box_on: boolean;
  public socket: any;
  public conversation: Array<ChatMessage> = [];
  public textMessage: string = "";
  public secondUser: User = null;
  public current_page: number = 1;
  public scrollPosition: string = 'top';
  public user: User;
  public infinite_completed = false;
  public send_message_loader = false;

  /**
   * Constructor
   */
  constructor(public navCtrl: NavController, public authService: AuthenticationService, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public chatService: ChatService) {
    this.reply_box_on = false;
    this.secondUser = navParams.get('secondUser');
    this.chatService.threadingUser = this.secondUser;
    this.user = this.authService.getUser();
    this.connectionToSocket();
    this.chatService.listenForGlobalMessages();
  }

  public connectionToSocket() {
    this.socket = io(this.chatService.socketUrl);
    this.socket.on('receive_message', (msg: any) => {
      if (msg.receiverId == this.user.id && msg.senderId == this.secondUser.id) {
        let just_recieved: ChatMessage = new ChatMessage(Math.random(), msg.senderId, msg.time, msg.message, 1);
        this.conversation.push(just_recieved);
        this.autoScroll();
      }
    });
  }

  public sendMessage() {
    if (this.textMessage != "") {
      this.send_message_loader = true;
      this.chatService.saveMessage({ second_person: this.secondUser.id, message: this.textMessage, created_at: this.utilityMethods.get_php_wala_time() }).subscribe((result) => {
        this.send_message_loader = false;
        this.conversation.push(result.data.messages);
        this.socket.emit('send_message', this.textMessage, this.secondUser.id, this.user.id, this.utilityMethods.get_php_wala_time());
        this.textMessage = "";
        this.autoScroll();
      }, (error) => {
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
    }
  }

  doInfinite(infiniteScroll) {
    this.chatService.fetchHistory(this.user.id, this.secondUser.id, this.current_page++).subscribe((result) => {
      if (this.conversation.length == 0)
        this.conversation = result.data.messages.reverse();
      else {
        for (let msg of result.data.messages) {
          this.conversation.unshift(msg);
        }
      }
      infiniteScroll.complete();
      if (result.data.messages.length < 10) {
        infiniteScroll.enable(false);
        this.infinite_completed = true;
      }
    }, (error) => {
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    });
  }

  /**
  * View LifeCycle Events
  */

  ionViewDidLoad() { }

  autoScroll() {
    setTimeout(() => {
      if (this.content != null)
        this.content.scrollToBottom();
    }, 100);
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
