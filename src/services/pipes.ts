import { Pipe } from '@angular/core';
import { AuthenticationService } from "./auth.service";

@Pipe({
  name: 'chatHeads'
})
export class ChatHeads {

  constructor(public auth: AuthenticationService) { }

  transform(input) {
    let user = this.auth.getUser();
    if (input.senderId == user.id) {
      return "assets/img/check-green.png";
    } else if (input.read == 0) {
      return "assets/img/check-red.png";
    } else {
      return "assets/img/checkYellow.png";
    }

  }
}

@Pipe({
  name: 'chat_name'
})

export class chatName {
  constructor(public auth: AuthenticationService) {

  }

  transform(input) {
    let user = this.auth.getUser();
    if (input[0].user.id != user.id)
      return input[0].user.firstName + ' ' + input[0].user.lastName;
    else
      return input[1].user.firstName + ' ' + input[0].user.lastName;
  }
}