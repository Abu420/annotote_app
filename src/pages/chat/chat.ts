import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';
/**
 * Services
 */
import { UtilityMethods } from '../../services/utility_methods';
import {ChatService} from "../../services/chat.service";

declare var io:any;

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
  public socket:any;
  public conversation:Array<any> = [];
  public textMessage:string = "";

  /**
   * Constructor
   */
  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public utilityMethods: UtilityMethods, public chatService:ChatService) {
    this.reply_box_on = false;
    this.connectionToSocket();
  }

  public connectionToSocket(){
    this.socket = io("http://139.162.37.73:5000");
    this.socket.on('receive_message', (msg:any)=>{
      if(msg.receiverId == this.getLoggedInUserId()){
        this.conversation.push(msg.message);
      }
    });
  }

  public getLoggedInUserId(){
    return 2;
  }

  public sendMessage(){
    if(this.textMessage != ""){
      this.socket.emit('send_message',this.textMessage,2);
      this.textMessage = "";
    }
  }

  /**
  * View LifeCycle Events
  */

  ionViewDidLoad() {}

  ionViewWillLeave() {}

  /**
  * Methods
  */


  open_annotote_site() {
    this.utilityMethods.launch('https://annotote.wordpress.com');
  }

  show_reply_box() {
    this.reply_box_on = true;
  }
}
