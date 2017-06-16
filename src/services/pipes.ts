import {Pipe} from '@angular/core';
import { AuthenticationService } from "./auth.service";

@Pipe({
  name: 'chatHeads'
})
export class ChatHeads {

  constructor(public auth:AuthenticationService){}

  transform(input) {
      let user = this.auth.getUser();
      if(input.read == 0){
        return "assets/img/check-red.png";
      }else{
        if(input.senderId == user.id){
          return "assets/img/check-green.png";
        }else{
          return "assets/img/check-yellow.png";
        }
      }
        
  }
}