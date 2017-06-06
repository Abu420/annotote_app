import {Component, ViewChild, ElementRef} from '@angular/core';
import {IonicPage, NavController, ModalController, NavParams, Content} from 'ionic-angular';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import { ChatService } from "../../services/chat.service";
import { ChatMessage } from "../../models/ChatMessage";
import { User } from "../../models/user";
import {AuthenticationService} from "../../services/auth.service";

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
  public loggedInUser: User = null;
  public current_page:number = 1;
  public scrollPosition:string = 'top';

  /**
   * Constructor
   */
  constructor(public navCtrl: NavController,public authService:AuthenticationService, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public chatService: ChatService) {
    this.reply_box_on = false;
    this.secondUser = navParams.get('secondUser');
    this.loggedInUser = this.authService.getUser();
    this.chatService.threadingUser = this.secondUser;
    this.connectionToSocket();
    this.chatService.listenForGlobalMessages();
  }

  public connectionToSocket() {
    this.socket = io(this.chatService.socketUrl);
    this.socket.on('receive_message', (msg: any) => {
      if ((msg.receiverId == this.getLoggedInUserId() && msg.senderId == this.secondUser.id)) {
        let message:ChatMessage = new ChatMessage(1, this.secondUser.firstName+' '+this.secondUser.lastName, msg.time, msg.message);
        message.time = msg.time;
        this.conversation.push(message);
        this.autoScroll();
      }else if(msg.receiverId == this.secondUser.id && msg.senderId == this.getLoggedInUserId()){
        let message:ChatMessage = new ChatMessage(1, this.loggedInUser.firstName+' '+this.loggedInUser.lastName, msg.time, msg.message);
        message.time = msg.time;
        this.conversation.push(message);
        this.autoScroll();
      }
    });
  }

  public getLoggedInUserId() {
    return this.loggedInUser.id;
  }

  doRefresh(refresher) {
    this.chatService.fetchHistory(this.getLoggedInUserId(),this.secondUser.id).subscribe((data)=>{
      let messages:Array<any> = data.json().data.messages;
      this.conversation = this.mapChatHistory(messages);
      refresher.complete();
    },(error)=>{});
  }

  public sendMessage() {
    if (this.textMessage != "") {
      this.chatService.saveMessage({second_person:this.secondUser.id, message:this.textMessage, created_at:this.chatService.currentUnixTimestamp()}).subscribe((data)=>{
        // this.mapChatHistory(data.json().data.messages);
      }, (error)=>{});
      this.socket.emit('send_message', this.textMessage, this.secondUser.id, this.loggedInUser.id, this.chatService.currentTime());
      this.textMessage = "";
      this.autoScroll();
    }
  }

  doInfinite(infiniteScroll) {
    console.log('Begin async operation');
    this.chatService.fetchHistory(this.getLoggedInUserId(),this.secondUser.id, ++this.current_page).subscribe((data)=>{
      let messages:Array<any> = data.json().data.messages;
      for(let message of this.mapChatHistory(messages)){
        this.conversation.unshift(message);
      }
      infiniteScroll.complete();
      if(messages.length <= 0){
        infiniteScroll.enable(false);
      }
    },(error)=>{});
  }

  /**
  * View LifeCycle Events
  */

  ionViewDidLoad() {
    this.utilityMethods.show_loader('loading previous messages...');
    this.chatService.fetchHistory(this.getLoggedInUserId(),this.secondUser.id).subscribe((data)=>{
      let messages:Array<any> = data.json().data.messages;
      this.conversation = this.mapChatHistory(messages);
      this.autoScroll();
      this.utilityMethods.hide_loader();
    },(error)=>{
      this.utilityMethods.hide_loader();
    });
  }

  autoScroll() {
    setTimeout(()=>{
      if(this.content != null)
        this.content.scrollToBottom();
    },100);
  }

  mapChatHistory(messages:Array<any>){
    let conversation:Array<ChatMessage> = [];
    for (let element of messages) {
      let sender = (parseInt(element.senderId) == this.getLoggedInUserId())?this.loggedInUser.firstName+' '+this.loggedInUser.lastName:this.secondUser.firstName+' '+this.secondUser.lastName;
      conversation.unshift(new ChatMessage(element.id, sender, element.createdAt, element.text));
    }
    return conversation;
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
