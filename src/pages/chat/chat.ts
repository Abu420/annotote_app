import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams, Content, PopoverController } from 'ionic-angular';
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
import { EditDeleteMessage } from './editDelPop';

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
  public fab_color: string = 'me';
  public user: User;
  public infinite_completed = false;
  public send_message_loader = false;
  public against_tote: boolean = false;
  public anotote_id: any = 0;
  public title = '';
  public tote: any;
  public move: boolean = false;

  /**
   * Constructor
   */
  constructor(public navCtrl: NavController,
    public authService: AuthenticationService,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public utilityMethods: UtilityMethods,
    public chatService: ChatService,
    public stream: Streams,
    public anototeService: AnototeService,
    public popoverCtrl: PopoverController) {
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
        let just_recieved: ChatMessage = new ChatMessage(Math.random(), msg.senderId, msg.time, msg.message, 1, msg.groupId);
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
        if (this.conversation.length == 0 || this.tote == null) {
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
        group_id: this.tote != null ? this.tote.chatGroupId : this.conversation[0].groupId
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
    this.move = true;
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

  editOrDelete(myEvent, message) {
    var params = {
      message: message
    }
    let popover = this.popoverCtrl.create(EditDeleteMessage, params);
    popover.onDidDismiss((data) => {
      if (data) {
        if (data.choice == 'share') {
          this.utilityMethods.share_content_native(message.text, "Anotote Chat message", null, '')
        } else if (data.choice == 'edit') {
          var text = Object.assign(message.text);
          this.utilityMethods.prompt(text, (data) => {
            if (data.Message != message.text && data.Message != '') {
              var params = {
                message_id: message.id,
                message_text: data.Message,
                updated_at: this.utilityMethods.get_php_wala_time()
              }
              this.chatService.updateMessage(params).subscribe((result) => {
                message.text = result.data.message.text;
              }, (error) => {
                if (error.code == -1) {
                  this.utilityMethods.internet_connection_error();
                }
              })
            } else {
              this.utilityMethods.doToast("Message should be altered and it should not be blank.")
            }
          })
        } else if (data.choice == 'delete') {
          this.utilityMethods.confirmation_message("Are you sure?", "Do your really want to delete this message", () => {
            this.chatService.deleteMessage({ id: message.id }).subscribe((data) => {
              this.conversation.splice(this.conversation.indexOf(message), 1);
            }, (err) => {
              if (err.code == -1) {
                this.utilityMethods.internet_connection_error();
              }
            })
          })
        }
      }
    })
    popover.present({
      ev: myEvent
    });
  }
}
