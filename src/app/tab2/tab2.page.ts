import { Component, inject, OnInit } from '@angular/core';
import { IonImg, IonGrid, IonIcon, IonCol, IonRow, IonFabButton, IonFab, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonIcon, IonGrid, IonImg, IonCol, IonRow, IonFabButton, IonFab, IonHeader, IonToolbar, IonTitle, IonContent]
})
export class Tab2Page implements OnInit {
  readonly photoService = inject(PhotoService);

  async ngOnInit() {
    await this.photoService.loadSaved();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }
}
