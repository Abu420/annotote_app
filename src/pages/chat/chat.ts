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
import { Streams } from '../../services/stream.service';
import { AnototeService } from '../../services/anotote.service';
import { ViewOptions } from '../anotote-list/view_options';

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
  public against_tote: boolean = false;
  public anotote_id: any = 0;
  public title = '';
  public tote: any;

  /**
   * Constructor
   */
  constructor(public navCtrl: NavController, public authService: AuthenticationService, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public chatService: ChatService, public stream: Streams, public anototeService: AnototeService) {
    this.reply_box_on = false;
    this.secondUser = navParams.get('secondUser');
    this.tote = navParams.get('full_tote');
    this.chatService.threadingUser = this.secondUser;
    this.user = this.authService.getUser();
    this.connectionToSocket();
    this.chatService.listenForGlobalMessages();
    if (navParams.get('against_anotote')) {
      this.against_tote = true;
      this.anotote_id = navParams.get('anotote_id');
      this.title = navParams.get('title');
    }
  }

  public connectionToSocket() {
    this.socket = io(this.chatService.socketUrl);
    this.socket.on('receive_message', (msg: any) => {
      // service called because in socket user becomes undefined
      if (msg.receiverId == this.authService.getUser().id && msg.senderId == this.secondUser.id) {
        let just_recieved: ChatMessage = new ChatMessage(Math.random(), msg.senderId, msg.time, msg.message, 1);
        this.conversation.push(just_recieved);
        this.autoScroll();
      }
    });
  }

  public sendMessage() {
    if (this.textMessage != "") {
      this.send_message_loader = true;
      this.chatService.saveMessage({ second_person: this.secondUser.id, message: this.textMessage, created_at: this.utilityMethods.get_php_wala_time(), subject: this.title, anotote_id: this.anotote_id }).subscribe((result) => {
        this.send_message_loader = false;
        if (this.conversation.length == 0) {
          this.stream.me_first_load = false
        } else {
          if (this.tote.chatGroup.messagesUser.length < 3)
            this.tote.chatGroup.messagesUser.push(result.data.messages)
          else {
            this.tote.chatGroup.messagesUser.splice(1, 1);
            this.tote.chatGroup.messagesUser.push(result.data.messages);
          }
        }
        this.conversation.push(result.data.messages);
        this.socket.emit('send_message', this.textMessage, this.secondUser.id, this.user.id, this.utilityMethods.get_php_wala_time());
        this.textMessage = "";
        this.autoScroll();
      }, (error) => {
        this.send_message_loader = false;
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
    }
  }

  public deleteChat() {
    this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to delete this chat group", () => {
      var params = {
        group_id: this.tote.chatGroupId
      }
      this.utilityMethods.show_loader('');
      this.anototeService.delete_chat_tote(params).subscribe((result) => {
        this.utilityMethods.hide_loader();
        this.stream.me_anototes.splice(this.stream.me_anototes.indexOf(this.tote), 1);
        this.utilityMethods.doToast("Chat tote deleted Successfully.")
        this.navCtrl.pop();
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      })
    })
  }

  doInfinite(infiniteScroll) {
    this.chatService.fetchHistory(this.user.id, this.secondUser.id, this.current_page++, this.anotote_id).subscribe((result) => {
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

  ionViewDidLoad() {
  }

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

  presentViewOptionsModal() {
    var params = {
      anotote: null,
      stream: 'me'
    }
    let viewsOptionsModal = this.modalCtrl.create(ViewOptions, params);
    viewsOptionsModal.onDidDismiss((preference) => {
    })
    viewsOptionsModal.present();
  }

  ionViewDidLeave() {
    this.chatService.threadingUser = null;
  }
}
