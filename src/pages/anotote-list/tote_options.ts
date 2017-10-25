import { Component, trigger, transition, style, animate } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, NavParams } from 'ionic-angular';
import { UtilityMethods } from '../../services/utility_methods';
import { AnototeService } from "../../services/anotote.service";
import { Clipboard } from '@ionic-native/clipboard';
import { AuthenticationService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
@Component({
  selector: 'anotote_options',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ transform: 'translateY(100%)', opacity: 0 }),
          animate('300ms', style({ transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateY(0)', opacity: 1 }),
          animate('300ms', style({ transform: 'translateY(100%)', opacity: 0 }))
        ])
      ]
    )
  ],
  templateUrl: 'tote_options.html',
})
export class AnototeOptions {

  // public share_type: any;
  // public share_content: string;
  public anotote: any;
  public stream: any;
  public show: boolean = true;
  public user;

  constructor(public clip: Clipboard,
    public utilityMethods: UtilityMethods,
    params: NavParams,
    public viewCtrl: ViewController,
    public anototeService: AnototeService,
    public authService: AuthenticationService,
    public searchService: SearchService) {
    // this.share_type = params.get('share_type');
    // this.share_content = params.get('share_content');
    this.anotote = params.get('anotote');
    this.stream = params.get('whichStream');
    this.user = authService.getUser();
  }

  presentTagsModal() {
    this.dismiss({ tags: true, share: false, which_share: '', delete: false });
  }

  share(which) {
    var toBeShared: string = this.stream == 'top' ? this.anotote.annotote.link : this.anotote.userAnnotote.annotote.link;
    if (which == 'facebook')
      this.utilityMethods.share_via_facebook("Anotote", null, toBeShared);
    else if (which == 'email')
      this.utilityMethods.share_via_email(toBeShared, "Anotote", "");
    else if (which == 'twitter')
      this.utilityMethods.share_via_twitter("Anotote", "", toBeShared);
    else if (which == 'copy') {
      this.clip.copy(toBeShared).then((success) => {
        this.utilityMethods.doToast("Link copied to clipboard");
      }, (error) => {
        this.utilityMethods.doToast("Couldn't copy");
      });
    } else
      this.utilityMethods.share_content_native("Anotote", null, null, toBeShared);
  }

  change_privacy(privacy) {
    if (privacy == 'public') {
      if (this.anotote.userAnnotote.privacy != 0) {
        // this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to change privacy to public?", () => {
        var params = {
          userAnnotote_ids: this.anotote.userAnnotote.id,
          privacy: 0
        }
        this.privacy(params, privacy);
        // })

      } else {
        this.utilityMethods.doToast("Anotote is already public.");
        return;
      }
    } else if (privacy == 'private') {
      if (this.anotote.userAnnotote.privacy != 1) {
        // this.utilityMethods.confirmation_message("Are you sure?", "Do you really want to change privacy to private?", () => {
        var params = {
          userAnnotote_ids: this.anotote.userAnnotote.id,
          privacy: 1
        }
        this.privacy(params, privacy);
        // })
      } else {
        this.utilityMethods.doToast("Anotote is already private.");
        return;
      }
    }


  }

  privacy(params, privacy) {
    // this.utilityMethods.show_loader('', false);
    this.anototeService.privatize_bulk_totes(params).subscribe((result) => {
      // this.utilityMethods.hide_loader();
      if (privacy == 'public')
        this.anotote.userAnnotote.privacy = 0;
      else
        this.anotote.userAnnotote.privacy = 1;
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    })
  }

  delete_anotote() {
    this.utilityMethods.confirmation_message('Are you sure?', 'Do you really want to delete this anotote?', () => {
      var params = {
        userAnnotote_ids: this.anotote.userAnnotote.id,
        delete: 1
      }
      this.utilityMethods.show_loader('');
      this.anototeService.delete_bulk_totes(params).subscribe((result) => {
        this.utilityMethods.hide_loader();
        this.utilityMethods.doToast("Anotote deleted successfully.");
        var params = {
          tags: false,
          delete: true
        }
        this.dismiss(params);
      }, (error) => {
        this.utilityMethods.hide_loader();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        }
      })
    })
  }

  bookmarkTote() {
    var links = [];
    links.push(this.stream == 'follows' ? this.anotote.userAnnotote.annotote.link : this.anotote.annotote.link)
    var params = {
      user_tote_id: this.anotote.userAnnotote.id,
      user_id: this.user.id,
      links: links,
      created_at: this.utilityMethods.get_php_wala_time()
    }
    this.utilityMethods.show_loader('', false);
    this.anototeService.bookmark_totes(params).subscribe((result) => {
      this.utilityMethods.hide_loader();
      if (result.status == 1) {
        this.utilityMethods.doToast("Bookmarked.");
        if (result.data.bookmarks.length > 0)
          for (let bookmark of result.data.bookmarks) {
            this.searchService.saved_searches.unshift(bookmark);
          }
      }
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    })
  }

  dismiss(data) {
    this.show = false;
    setTimeout(() => {
      if (data)
        this.viewCtrl.dismiss(data);
      else
        this.viewCtrl.dismiss({ tags: false, delete: false });
    }, 300)

  }

  chat() {
    this.show = false;
    setTimeout(() => {
      this.viewCtrl.dismiss({ tags: false, delete: false, chat: true });
    }, 300)
  }

}