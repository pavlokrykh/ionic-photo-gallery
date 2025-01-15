import { Component, inject, OnInit } from '@angular/core';
import { IonImg, IonGrid, IonIcon, IonCol, IonRow, IonFabButton, IonFab, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { PhotoService, UserPhoto } from '../services/photo.service';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonIcon, IonGrid, IonImg, IonCol, IonRow, IonFabButton, IonFab, IonHeader, IonToolbar, IonTitle, IonContent]
})
export class Tab2Page implements OnInit {
  public readonly photoService = inject(PhotoService);
  public readonly actionSheetController = inject(ActionSheetController);

  async ngOnInit() {
    await this.photoService.loadSaved();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  async showActionSheet(photo: UserPhoto, index: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => this.photoService.deletePicture(photo, index),
      }, {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {}, // auto close
        }]
    });
    await actionSheet.present();
  }
}
