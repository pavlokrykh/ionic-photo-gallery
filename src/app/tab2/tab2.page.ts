import { Component, inject } from '@angular/core';
import { IonImg, IonIcon, IonCol, IonRow, IonGrid, IonFabButton, IonFab, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonIcon, IonImg, IonCol, IonRow, IonGrid, IonFabButton, IonFab, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent]
})
export class Tab2Page {
  readonly photoService = inject(PhotoService);

  constructor() {}

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }
}
