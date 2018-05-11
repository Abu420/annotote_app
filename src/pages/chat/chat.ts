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
import { Search } from "../search/search";
import { AnototeEditor } from "../anotote-editor/anotote-editor";
import { ChatToteOptions } from "../anotote-list/chat_tote";
import { TagsPopUp } from "../anotote-list/tags";
import { StatusBar } from "@ionic-native/status-bar";
import { FollowsPopup } from "../anotote-list/follows_popup";
import { Keyboard } from '@ionic-native/keyboard';
import { AnototeList } from '../anotote-list/anotote-list';

declare var io: any;

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
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
  public secondUser: any = null;
  public current_page: number = 1;
  public scrollPosition: string = 'top';
  public user: User;
  public infinite_completed = false;
  public send_message_loader = false;
  public against_tote: boolean = false;
  public anotote_id: any = 0;
  public title = '';
  public tote: any;
  public move: boolean = false;
  public current_color = 'me';
  public firstUser: any = null;
  public contains = true;
  public newChatTitle = '';
  public titleField: boolean = false;
  public groupId: number = 0;
  public privacyForNewTote: number = 0;
  public fbLoading: boolean = true;
  public options: boolean = false;
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
    public statusBar: StatusBar,
    public anototeService: AnototeService,
    public key: Keyboard,
    public popoverCtrl: PopoverController) {
    key.onKeyboardShow().subscribe(() => {
      if (utilityMethods.whichPlatform() == 'ios') {
        setTimeout(() => {
          var snackbar = document.getElementById('message');
          snackbar.addEventListener("keydown", function (e) { console.log(e.key, e.char, e.keyCode) })
          snackbar.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'shift' }));
          this.content.scrollToBottom();
        }, 500);
      }
    })
    this.reply_box_on = true;
    this.secondUser = navParams.get('secondUser');
    this.tote = navParams.get('full_tote');
    if (this.tote && this.tote.chatGroup) {
      this.markMessagesRead(this.tote.chatGroup.messagesUser);
      this.groupId = this.tote.chatGroup.id;
    }
    this.chatService.threadingUser = this.secondUser;
    this.user = this.authService.getUser();
    this.connectionToSocket();
    this.chatService.listenForGlobalMessages();
    if (navParams.get('against_anotote')) {
      this.against_tote = true;
      this.anotote_id = navParams.get('anotote_id');
      this.title = navParams.get('title');
      // this.groupId = this.tote.chatGroup.id;
      if (this.tote.chatGroup == null) {
        this.tote.createdAt = (new Date()).getTime() / 1000;
      }
    }
    if (navParams.get('group')) {
      var group = navParams.get('group');
      this.tote = {
        chatGroup: group
      }
      this.groupId = group.id;
      this.anotote_id = group.groupUsers[0].anototeId;
      // this.title = group.subject;
    }
    if (navParams.get('color')) {
      this.current_color = navParams.get('color');
      if (this.current_color != 'me') {
        this.firstUser = navParams.get('firstUser');
        this.contains = navParams.get('containsMe');
      }
    }
    if (navParams.get('notification_group_id'))
      this.groupId = navParams.get('notification_group_id');
    var lastView = this.navCtrl.last();
    if (lastView.data.color && navParams.get('against_anotote')) {
      if (lastView.data.color == 'me') {
        this.statusBar.backgroundColorByHexString('#3bde00');
      } else if (lastView.data.color == 'follows') {
        this.statusBar.backgroundColorByHexString('#f4e300');
      } else if (lastView.data.color == 'top') {
        this.statusBar.backgroundColorByHexString('#fb9df0');
      }
    } else {
      this.statusBar.backgroundColorByHexString('#3bde00');
    }
  }

  markMessagesRead(messages) {
    for (let message of messages) {
      message.read = 1;
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
      var params: any = {
        second_person: this.secondUser.id,
        message: this.textMessage,
        created_at: this.utilityMethods.get_php_wala_time(),
        subject: this.title,
        anotote_id: this.anotote_id,
        group_id: this.groupId
      }
      if (this.tote == null) {
        // if (this.anotote_id == 0) {
        //   params.privacy = 1
        // } else {
        params.privacy = this.privacyForNewTote;
        // }
      } else {
        if (this.tote.chatGroup)
          params.privacy = this.tote.chatGroup.groupUsers[0].privacy;
        else
          params.privacy = this.privacyForNewTote;
      }
      this.chatService.saveMessage(params).subscribe((result) => {
        this.send_message_loader = false;
        // this.myInput.nativeElement.style.height = 60 + 'px';
        if (this.conversation.length == 0 || this.tote == null) {
          this.stream.me_first_load = false
        } else {
          if (this.tote.chatGroup.messagesUser.length < 3)
            this.tote.chatGroup.messagesUser.push(result.data.messages)
          else {
            this.tote.chatGroup.messagesUser.splice(0, 1);
            this.tote.chatGroup.messagesUser.push(result.data.messages);
          }
        }
        this.conversation.push(result.data.messages);
        this.socket.emit('send_message', this.textMessage, this.secondUser.id, this.user.id, this.utilityMethods.get_php_wala_time());
        this.textMessage = "";
        this.autoScroll();
        var input = document.getElementById('message');
        input.style.height = 'auto';
      }, (error) => {
        this.send_message_loader = false;
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      });
    }
  }

  public deleteChat() {
    if (this.contains) {
      this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to delete this chat group", () => {
        var params = {
          group_id: this.tote != null ? this.tote.chatGroupId : this.conversation[0].groupId
        }
        this.utilityMethods.show_loader('');
        this.anototeService.delete_chat_tote(params).subscribe((result) => {
          this.utilityMethods.hide_loader();
          if (this.tote != null)
            this.stream.me_anototes.splice(this.stream.me_anototes.indexOf(this.tote), 1);
          else
            this.stream.me_first_load = false;
          this.utilityMethods.doToast("Chat tote deleted Successfully.")
          this.navCtrl.pop();
        }, (error) => {
          this.utilityMethods.hide_loader();
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          }
        })
      })
    } else {
      this.utilityMethods.doToast("You cannot delete someone's chat group");
    }
  }

  doInfinite(infiniteScroll) {
    this.fbLoading = true;
    this.chatService.fetchHistory(this.contains == true ? this.user.id : this.firstUser.id, this.secondUser.id, this.current_page++, this.anotote_id, this.groupId).subscribe((result) => {
      this.fbLoading = false;
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
      this.fbLoading = false;
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
      if (this.content && this.content != null)
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

  editOrDelete(message) {
    var params = {
      message: message,
      contains: this.contains,
      chatToteOpts: false
    }
    let anototeOptionsModal = this.modalCtrl.create(EditDeleteMessage, params);
    anototeOptionsModal.onDidDismiss(data => {
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
                read_status: 0,
                updated_at: this.utilityMethods.get_php_wala_time()
              }
              this.chatService.updateMessage(params).subscribe((result) => {
                message.text = result.data.message.text;
                if (this.tote == null) {
                  this.stream.me_first_load = false;
                } else {
                  for (let txt of this.tote.chatGroup.messagesUser) {
                    if (txt.id == message.id) {
                      txt.text = result.data.message.text;
                    }
                  }
                }
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
              if (this.tote == null) {
                this.stream.me_first_load = false;
              } else {
                this.tote.chatGroup.messagesUser = [];
                this.tote.chatGroup.messagesUser.push(this.conversation[this.conversation.length - 3]);
                this.tote.chatGroup.messagesUser.push(this.conversation[this.conversation.length - 2]);
                this.tote.chatGroup.messagesUser.push(this.conversation[this.conversation.length - 1]);
              }
            }, (err) => {
              if (err.code == -1) {
                this.utilityMethods.internet_connection_error();
              }
            })
          })
        } else if (data.choice == 'read') {
          var params = {
            message_id: message.id,
            message_text: message.text,
            read_status: message.read == 1 ? 0 : 1,
            updated_at: this.utilityMethods.get_php_wala_time()
          }
          this.chatService.updateMessage(params).subscribe((result) => {
            message.read = message.read == 1 ? 0 : 1;
            if (this.tote == null) {
              this.stream.me_first_load = false;
            } else {
              for (let txt of this.tote.chatGroup.messagesUser) {
                if (txt.id == message.id) {
                  txt.read = message.read;
                }
              }
            }
          }, (error) => {
            if (error.code == -1) {
              this.utilityMethods.internet_connection_error();
            }
          })
        } else if (data.choice == 'tags') {
          var paramsObj = {
            chatId: message.id,
            tags: message.messageTags,
            whichStream: 'chat',
            chatOrTxt: false,
            participants: this.tote.chatGroup.groupUsers
          }
          let tagsModal = this.modalCtrl.create(TagsPopUp, paramsObj);
          tagsModal.present();
        }
      }
    })
    anototeOptionsModal.present();
    // let popover = this.popoverCtrl.create(EditDeleteMessage, params);

    // popover.present({
    //   ev: myEvent
    // });
  }

  showOptions() {
    if (this.conversation.length > 0 && (this.tote && this.tote.chatGroup)) {
      var params = {
        message: this.conversation[0],
        contains: this.contains,
        chatToteOpts: true,
        tote: this.tote != null ? this.tote.chatGroup.groupUsers : null,
        toteId: this.tote != null ? this.tote.chatGroup.messagesUser[0].anototeId : this.conversation[0].anototeId,
        tags: this.tote != null ? this.tote.chatGroup.chatTags : []
      }
      this.options = true;
      let anototeOptionsModal = this.modalCtrl.create(EditDeleteMessage, params);
      anototeOptionsModal.onDidDismiss(data => {
        this.options = false;
        if (data) {
          if (data.choice == 'delete') {
            this.deleteChat();
          } else if (data.choice == 'tags') {
            var paramsObj = {
              chatId: this.tote.chatGroup.id,
              tags: this.tote.chatGroup.chatTags,
              whichStream: 'chat',
              chatOrTxt: true,
              participants: this.tote.chatGroup.groupUsers
            }
            let tagsModal = this.modalCtrl.create(TagsPopUp, paramsObj);
            tagsModal.present();
          }
        }
      })
      anototeOptionsModal.present();
    } else {
      var paramz = {
        isNew: true,
        privacy: this.privacyForNewTote,
        id: this.tote == null ? 0 : 1
      }
      this.options = true;
      let anototeOptionsModal = this.modalCtrl.create(EditDeleteMessage, paramz);
      anototeOptionsModal.onDidDismiss((data) => {
        this.options = false;
        if (data) {
          if (data.choice == 'delete') {
            if (this.conversation.length == 0) {
              this.navCtrl.pop();
            } else {
              this.deleteChat();
            }
          }
          this.privacyForNewTote = data.privacy;
        }
      })
      anototeOptionsModal.present();
    }
  }

  showTitleField() {
    if (this.am_i_participant()) {
      this.titleField = true;
      if (this.tote && this.tote.chatGroup) {
        this.newChatTitle = JSON.parse(JSON.stringify(this.tote.chatGroup.messagesUser[0].subject));
      } else {
        if (this.conversation.length > 0) {
          this.newChatTitle = JSON.parse(JSON.stringify(this.conversation[0].subject));
        } else {
          if (this.tote != null) {
            // if (this.tote.userAnnotote.annotote) {
            //   this.newChatTitle = this.tote.userAnnotote.annotote.title;
            // } else {
            //   this.newChatTitle = this.tote.annotote.title;
            // }
            this.newChatTitle = this.title;
          }
        }
      }
    }
  }

  cancelTitleEdit() {
    this.titleField = false;
  }

  updateSubject() {
    if (this.conversation.length > 0) {
      if (this.newChatTitle != '') {
        var params = {
          group_id: this.conversation[0].groupId,
          subject: this.newChatTitle,
          updated_at: this.utilityMethods.get_php_wala_time()
        }
        this.chatService.updateTitle(params).subscribe((success) => {
          if (this.tote && this.tote.chatGroup) {
            this.titleField = false;
            this.tote.chatGroup.messagesUser[0].subject = this.newChatTitle;
          } else if (this.tote && this.tote.chatGroup != null) {
            this.titleField = false;
            this.title = this.newChatTitle;
            this.stream.me_first_load = false;
          } else {
            this.titleField = false;
            this.conversation[0].subject = this.newChatTitle;
            this.stream.me_first_load = false;
          }
        }, (error) => {
          this.titleField = false;
          if (error.code == -1) {
            this.utilityMethods.internet_connection_error();
          }
        });
      } else {
        this.utilityMethods.doToast("Cannot set an empty title");
        this.titleField = false;
      }
    } else {
      this.titleField = false;
      this.title = this.newChatTitle;
    }
  }

  openSearchPopup() {
    this.statusBar.backgroundColorByHexString('#323232');
    let searchModal = this.modalCtrl.create(Search, {});
    searchModal.onDidDismiss(data => {
      if (this.current_color == 'me')
        this.statusBar.backgroundColorByHexString('#3bde00');
      else if (this.current_color == 'follows')
        this.statusBar.backgroundColorByHexString('#f4e300');
      else if (this.current_color == 'top')
        this.statusBar.backgroundColorByHexString('#fb9df0');

      if (data.go_to_browser) {
        var anotote = data.anotote;
        if (data.neworold) {
          this.navCtrl.push(AnototeEditor, { url: anotote, FROM: 'search', WHICH_STREAM: 'anon', actual_stream: 'anon' });
        } else
          this.navCtrl.push(AnototeEditor, { ANOTOTE: anotote.userAnnotote, FROM: 'search_result', WHICH_STREAM: 'anon', HIGHLIGHT_RECEIVED: null, actual_stream: anotote.userAnnotote.active_tab });
      }
    });
    searchModal.present();
  }

  addBtn() {
    var params: any = {
      anotote: null,
      stream: 'homeheader',
      findChatter: true
    }
    let chatTote = this.modalCtrl.create(ChatToteOptions, params);
    chatTote.onDidDismiss((data) => {
      if (data.chat) {
        if (!data.group)
          this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: false, anotote_id: null, title: '' });
        else
          this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: false, anotote_id: null, title: '', group: data.group });
      } else if (data.browser) {
        this.navCtrl.push(AnototeList, { color: 'me', from: 'listing', url: data.tote }, { animate: false });
      }
    })
    chatTote.present();
  }

  chat_participants_from_tote() {
    var users = [];
    if (this.tote.chatGroup) {
      for (let group of this.tote.chatGroup.groupUsers) {
        users.push(group.user);
      }
      let anototeOptionsModal = this.modalCtrl.create(FollowsPopup, { follows: users, participant: true });
      anototeOptionsModal.onDidDismiss(data => {
      });
      anototeOptionsModal.present();
    }
  }

  am_i_participant() {
    if (this.tote && this.tote.chatGroup) {
      for (let user of this.tote.chatGroup.groupUsers) {
        if (user.user.id == this.user.id) {
          return true;
        }
      }
      return false;
    } else
      return true;
  }

  // @ViewChild('myInput') myInput: ElementRef;

  // resize() {
  //   this.myInput.nativeElement.style.height = this.myInput.nativeElement.scrollHeight + 'px';
  // }
}
