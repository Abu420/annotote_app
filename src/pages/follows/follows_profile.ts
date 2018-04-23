import { Component, trigger, transition, style, animate, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, NavParams, Events, Platform, Loading, ActionSheetController, Content } from 'ionic-angular';
import { Chat } from '../chat/chat';
import { ChangePassword } from '../change-password/change-password';
import { EditProfile } from '../edit-profile/edit-profile';

import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera, CameraOptions } from '@ionic-native/camera';
/**
 * Services
 */
import { Constants } from '../../services/constants.service';
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { AuthenticationService } from '../../services/auth.service';
import { Streams } from '../../services/stream.service';
import { TagsForChat } from '../chat_profileTags/tags';
import { AnototeList } from '../anotote-list/anotote-list';
import { TagsPopUp } from '../anotote-list/tags';
import { StatusBar } from "@ionic-native/status-bar";
import { Follows } from "./follows";
import { ChatToteOptions } from '../anotote-list/chat_tote';
import { TagsExclusive } from '../tagsExclusive/tags';

declare var cordova: any;

@Component({
  selector: 'follow_profile',
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
  templateUrl: 'follows_profile.html',
})
export class Profile {
  @ViewChild(Content) content: Content;
  public show: boolean = true;
  private image_base_path: string;
  public profileData: any;
  public from_page: string;
  public is_it_me: boolean;
  private lastImage: string = null;
  public new_description: string = '';
  public nameInputIndex: number = 0;
  public isTagging: boolean = false;
  public nameEntered: string = '';
  private users: any = [];
  private search_user: boolean = false;
  private no_user_found: boolean = false;
  private show_autocomplete: boolean = false;

  constructor(public stream: Streams,
    private zone: NgZone,
    private camera: Camera,
    private transfer: Transfer,
    public modalCtrl: ModalController,
    private file: File,
    private filePath: FilePath,
    public actionSheetCtrl: ActionSheetController,
    public constants: Constants,
    params: NavParams,
    public navCtrl: NavController,
    public authService: AuthenticationService,
    public events: Events,
    public viewCtrl: ViewController,
    public utilityMethods: UtilityMethods,
    public searchService: SearchService,
    private platform: Platform,
    public statusbar: StatusBar) {
    var user = this.authService.getUser();
    this.profileData = params.get('data');
    if (this.profileData.user.description != null) {
      this.new_description = Object.assign(this.profileData.user.description);
    }
    this.from_page = params.get('from_page');

    if (this.profileData.user.id == user.id)
      this.is_it_me = true;
    else
      this.is_it_me = false;
  }

  ionViewDidEnter() {
    this.statusbar.backgroundColorByHexString('#323232');
    this.statusbar.hide();
  }

  go_to_thread() {
    this.statusbar.show();
    // this.navCtrl.push(Chat, { secondUser: this.profileData.user });
    var params = {
      anotote: null,
      stream: 'anon',
      findChatter: true,
      user: this.profileData.user,
      from: 'profile'
    }
    let chatTote = this.modalCtrl.create(ChatToteOptions, params);
    chatTote.onDidDismiss((data) => {
      if (data.chat) {
        if (!data.group) {
          this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: false, anotote_id: null, title: '' });
        } else {
          this.navCtrl.push(Chat, { secondUser: data.user, against_anotote: false, anotote_id: null, title: '', group: data.group });
        }
      }
    })
    chatTote.present();
  }

  go_to_stream() {
    this.statusbar.show();
    if (this.is_it_me)
      this.navCtrl.push(AnototeList, { color: 'me' });
    else if (this.profileData.user.isFollowed == 1)
      this.navCtrl.push(AnototeList, { color: 'follows', userId: this.profileData.user.id, username: this.profileData.user });
    else
      this.navCtrl.push(AnototeList, { color: 'anon', userId: this.profileData.user.id, username: this.profileData.user });
  }

  showTags() {
    var params = {
      annotation_id: null,
      profile: 'profile',
      tags: this.profileData.user.userTags,
      whichStream: this.is_it_me == true ? 'me' : 'follows',
      annotote: false
    }
    let tagsModal = this.modalCtrl.create(TagsPopUp, params);
    tagsModal.present();
  }

  followUser() {
    let self = this;
    var current_time = (new Date()).getTime() / 1000;
    var toast = this.utilityMethods.doLoadingToast("Please wait...");
    this.searchService.follow_user({
      created_at: current_time,
      follows_id: this.profileData.user.id
    }).subscribe((response) => {
      toast.dismiss();
      this.profileData.user.isFollowed = 1;
      this.stream.follow_first_load = false;
      this.stream.me_first_load = false;
      this.stream.top_first_load = false;
      if (this.from_page == 'search_results')
        this.events.publish('user:followed', this.profileData.user.id);
    }, (error) => {
      toast.dismiss();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    });
  }

  show_menu() {
    this.presentActionSheet();
  }

  updateUser() {
    if (this.profileData.user.fristName != '' && this.new_description != '') {
      var hashTags = this.searchTags('#');
      var cashTags = this.searchTags('$');
      var urls = this.uptags(this.new_description);
      var mentions = this.userTags();
      var tags = [];
      if (hashTags.length > 0) {
        for (var i = 0; i < hashTags.length; i++) {
          var tag = {
            text: hashTags[i],
            tag_id: 3,
          }
          tags.push(tag);
        }
      }
      if (cashTags.length > 0) {
        for (var i = 0; i < cashTags.length; i++) {
          var tag = {
            text: cashTags[i],
            tag_id: 4,
          }
          tags.push(tag);
        }
      }
      if (urls.length > 0) {
        for (var i = 0; i < urls.length; i++) {
          var tag = {
            text: urls[i],
            tag_id: 1,
          }
          tags.push(tag);
        }
      }
      if (mentions.length > 0) {
        for (var i = 0; i < mentions.length; i++) {
          var tag = {
            text: mentions[i],
            tag_id: 2,
          }
          tags.push(tag);
        }
      }
      var toast = this.utilityMethods.doLoadingToast('Updating...');
      this.authService.update_profile({
        email: this.profileData.user.email,
        first_name: this.profileData.user.firstName,
        last_name: this.profileData.user.lastName,
        description: this.new_description,
        updated_at: this.utilityMethods.get_php_wala_time()
      }).subscribe((response) => {
        toast.dismiss();
        this.authService.updateUser(response.data.user);
        this.profileData.user.description = this.new_description;
        if (tags.length > 0) {
          var params = {
            tags: tags,
            user_id: this.profileData.user.id,
            created_at: this.utilityMethods.get_php_wala_time(),
          }
          this.searchService.add_tags_to_profile_all(params).subscribe((result) => {
            this.profileData.user.userTags = result;
          }, (error) => {
            if (error.code == -1) {
              this.utilityMethods.internet_connection_error();
            } else {
              this.utilityMethods.doToast("Couldn't add tag to annotation.");
            }
          })
        }
        this.utilityMethods.doToast('Profile updated successfully.');
      }, (error) => {
        toast.dismiss();
        if (error.code == -1) {
          this.utilityMethods.internet_connection_error();
        } else
          this.utilityMethods.message_alert('Error', 'This email has already been taken.');
      });
    } else {
      this.utilityMethods.doToast("Field not updated.");
    }
  }

  cancelUpdate() {
    this.new_description = Object.assign(this.profileData.user.description);
  }

  presentActionSheet() {
    var buttons;
    if (this.is_it_me) {
      buttons = [
        {
          text: 'Change your password',
          handler: () => {
            this.navCtrl.push(ChangePassword, {});
          }
        },
        {
          text: 'Change email',
          handler: () => {
            let editProfile = this.modalCtrl.create(EditProfile, {});
            editProfile.onDidDismiss(data => {
              var user = this.authService.getUser();
              this.profileData.user = user;
            });
            editProfile.present();
            // this.navCtrl.push(EditProfile, {});
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }
      ];
    } else {
      buttons = [
        {
          text: (this.profileData.user.isFollowed == 0) ? 'Follow' : 'Unfollow',
          handler: () => {
            if (this.profileData.user.isFollowed == 0)
              this.followUser();
            else
              this.unFollowUser();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }
      ];
      if (this.profileData.user.isFollowed == 1) {
        buttons.unshift({
          text: 'Chat',
          handler: () => {
            // if (this.profileData.user.isFollowed == 1)
            this.go_to_thread();
          }
        })
      }
    }
    let actionSheet = this.actionSheetCtrl.create({
      title: '',
      buttons: buttons
    });

    actionSheet.present();
  }

  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {
      // Special handling for Android library
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    }, (err) => {
      this.utilityMethods.doToast('Error while selecting image.');
    });
  }

  private createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  // Copy the image to a local folder
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      this.lastImage = newFileName;
      this.uploadImage();
    }, error => {
      this.utilityMethods.doToast('Error while storing file.');
    });
  }

  // Always get the accurate path to your apps folder
  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }

  public presentProfilePictureActionSheet() {
    if (!this.is_it_me)
      return;
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  public uploadImage() {
    // Destination URL
    var url = this.constants.API_BASEURL + '/upload-profile-image';

    // File for Upload
    var targetPath = this.pathForImage(this.lastImage);

    // File name only
    var filename = this.lastImage;

    var _token = localStorage.getItem('_token');
    var options = {
      fileKey: "image",
      fileName: filename,
      chunkedMode: false,
      headers: {
        'Authorization': _token
      },
      mimeType: "multipart/form-data",
      params: { 'fileName': filename }
    };

    const fileTransfer: TransferObject = this.transfer.create();

    var toast = this.utilityMethods.doLoadingToast('Uploading');

    // Use the FileTransfer to upload the image
    fileTransfer.upload(targetPath, url, options).then(data => {
      toast.dismiss();
      this.utilityMethods.doToast('Image succesful uploaded.');
      var response = JSON.parse(data.response);
      this.authService.updateUser(response.data.user);
      this.profileData.user = response.data.user;
    }, err => {
      toast.dismiss();
      this.utilityMethods.doToast('Error while uploading file.');
    });
  }

  unFollowUser() {
    let self = this;
    var current_time = (new Date()).getTime() / 1000;
    var toast = this.utilityMethods.doLoadingToast('Please wait...');
    this.searchService.un_follow_user({
      created_at: current_time,
      follows_id: this.profileData.user.id
    }).subscribe((response) => {
      toast.dismiss();
      this.profileData.user.isFollowed = 0;
      this.stream.follow_first_load = false;
      this.stream.me_first_load = false;
      this.stream.top_first_load = false;
      if (this.from_page == 'search_results')
        this.events.publish('user:unFollowed', this.profileData.user.id);
    }, (error) => {
      toast.dismiss();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    });
  }

  dismiss(action) {
    this.statusbar.show();
    this.show = false;
    setTimeout(() => {
      this.viewCtrl.dismiss();
    }, 300)
  }

  showFollows(follows_or_follower) {
    var params = {
      userid: this.profileData.user.id,
      type: follows_or_follower
    }
    let follows = this.modalCtrl.create(Follows, params);
    follows.onDidDismiss(data => {
    });
    follows.present();
  }

  tag_user(event) {
    if (event.key == '@' || event.key == '#' || event.key == '$') {
      this.nameInputIndex = event.target.selectionStart;
      var params = {
        tag: event.key,
        id: 0
      }
      if (event.key == '@')
        params.id = 2;
      else if (event.key == '#')
        params.id = 3
      else if (event.key == '$')
        params.id = 4

      let tagsExlusive = this.modalCtrl.create(TagsExclusive, params);
      tagsExlusive.onDidDismiss((data) => {
        if (data) {
          if (params.id != 2)
            this.new_description = this.new_description.substring(0, this.nameInputIndex) + data.tag + " " + this.new_description.substring(this.nameInputIndex, this.new_description.length);
          else if (params.id == 2)
            this.new_description = this.new_description.substring(0, this.nameInputIndex - 1) + data.tag + " " + this.new_description.substring(this.nameInputIndex, this.new_description.length);
        }
      })
      tagsExlusive.present();
    }
  }

  searchTags(tag) {
    var tags = [];
    var check = false;
    if (this.new_description[0] == tag) {
      check = true;
    }
    var tagsincomment = this.new_description.split(tag);
    var i = check ? 0 : 1;
    for (var i = 1; i < tagsincomment.length; i++) {
      var temp = tagsincomment[i].split(' ');
      temp[0] = temp[0].replace(/[^\w\s]/gi, "")
      tags.push(temp[0]);
    }
    return tags;
  }

  userTags() {
    var matches = [];
    var finalized = [];
    matches = this.new_description.split('`')
    for (let match of matches) {
      if (match[0] == '@') {
        finalized.push(match);
      }
    }
    return finalized;
  }

  uptags(comment) {
    var matches = [];
    matches = comment.match(/\bhttps?:\/\/\S+/gi);
    if (matches)
      for (let match of matches) {
        this.new_description = this.new_description.replace(match, ' ^ ');
      }
    return matches == null ? [] : matches;
  }

}