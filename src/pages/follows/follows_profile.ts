import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, ModalController, NavParams, Events, Platform, Loading, ActionSheetController } from 'ionic-angular';
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
import { Constants } from '../../services/constants.service'
import { UtilityMethods } from '../../services/utility_methods';
import { SearchService } from '../../services/search.service';
import { AuthenticationService } from '../../services/auth.service';

declare var cordova: any;

@Component({
  selector: 'follow_profile',
  templateUrl: 'follows_profile.html',
})
export class Profile {

  private image_base_path: string;
  public profileData: any;
  public from_page: string;
  public is_it_me: boolean;
  private lastImage: string = null;

  constructor(private camera: Camera, private transfer: Transfer, public modalCtrl: ModalController, private file: File, private filePath: FilePath, public actionSheetCtrl: ActionSheetController, public constants: Constants, params: NavParams, public navCtrl: NavController, public authService: AuthenticationService, public events: Events, public viewCtrl: ViewController, public utilityMethods: UtilityMethods, public searchService: SearchService, private platform: Platform) {

    this.image_base_path = this.constants.API_BASEURL;
    var user = this.authService.getUser();
    if (params.get('is_it_me')) {
      this.profileData = user;
      this.from_page = params.get('from_page');
    } else {
      this.profileData = params.get('data');
      this.from_page = params.get('from_page');
    }
    var current_user = this.authService.getUser();
    if (this.profileData.user.id == current_user.id)
      this.is_it_me = true;
    else
      this.is_it_me = false;
  }

  go_to_thread() {
    this.navCtrl.push(Chat, { secondUser: this.profileData.user });
  }

  followUser() {
    let self = this;
    var current_time = (new Date()).getTime() / 1000;
    this.utilityMethods.show_loader('Please wait...');
    this.searchService.follow_user({
      created_at: current_time,
      follows_id: this.profileData.user.id
    }).subscribe((response) => {
      this.utilityMethods.hide_loader();
      this.profileData.user.isFollowed = 1;
      if (this.from_page == 'search_results')
        this.events.publish('user:followed', this.profileData.user.id);
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    });
  }

  show_menu() {
    this.presentActionSheet();
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
          text: 'Edit profile',
          handler: () => {
            let editProfile = this.modalCtrl.create(EditProfile, {});
            editProfile.onDidDismiss(data => {
              var user = this.authService.getUser();
              this.profileData.user = user;
              console.log(this.profileData)
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
          text: 'Send Message',
          handler: () => {
            if (this.profileData.user.isFollowed == 1)
              this.go_to_thread();
          }
        },
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
    }
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select',
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
      this.presentToast('Error while selecting image.');
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
      this.presentToast('Error while storing file.');
    });
  }

  private presentToast(text) {
    this.utilityMethods.doToast(text);
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

    this.utilityMethods.show_loader('');

    // Use the FileTransfer to upload the image
    fileTransfer.upload(targetPath, url, options).then(data => {
      this.utilityMethods.hide_loader();
      this.presentToast('Image succesful uploaded.');
      var response = JSON.parse(data.response);
      this.authService.updateUser(response.data.user);
      console.log(response);
    }, err => {
      this.utilityMethods.hide_loader();
      this.presentToast('Error while uploading file.');
    });
  }

  unFollowUser() {
    let self = this;
    var current_time = (new Date()).getTime() / 1000;
    this.utilityMethods.show_loader('Please wait...');
    this.searchService.un_follow_user({
      created_at: current_time,
      follows_id: this.profileData.user.id
    }).subscribe((response) => {
      this.utilityMethods.hide_loader();
      this.profileData.user.isFollowed = 0;
      if (this.from_page == 'search_results')
        this.events.publish('user:unFollowed', this.profileData.user.id);
    }, (error) => {
      this.utilityMethods.hide_loader();
      if (error.code == -1) {
        this.utilityMethods.internet_connection_error();
      }
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}