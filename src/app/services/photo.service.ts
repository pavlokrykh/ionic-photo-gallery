import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { from, map, switchMap, take, Observable, forkJoin } from 'rxjs';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private platform = inject(Platform);
  private http = inject(HttpClient);

  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';

  addNewToGallery() {
    from(Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    })).pipe(
      take(1),
      switchMap(capturedPhoto => this.savePicture(capturedPhoto))
    ).subscribe(savedImage => {
      this.photos.unshift(savedImage);
      Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos),
      });
    });
  }

  loadSaved() {
    return from(Preferences.get({ key: this.PHOTO_STORAGE })).pipe(
      map(({ value }) => (value ? JSON.parse(value) : []) as UserPhoto[]),
      switchMap(photos => {
        this.photos = photos;

        if (!this.platform.is('hybrid')) {
          // If we have photos and we're not on hybrid, load them all in parallel
          if (photos.length > 0) {
            const readFileObservables = photos.map(photo =>
              from(Filesystem.readFile({
                path: photo.filepath,
                directory: Directory.Data,
              })).pipe(
                map(readFile => ({
                  ...photo,
                  webviewPath: `data:image/jpeg;base64,${readFile.data}`
                }))
              )
            );

            return forkJoin(readFileObservables).pipe(
              map(updatedPhotos => {
                this.photos = updatedPhotos;
                return this.photos;
              })
            );
          }
        }

        // If we're on hybrid or have no photos, return the photos as-is
        return from([this.photos]);
      })
    );
  }

  async deletePicture(photo: UserPhoto, position: number) {
    this.photos.splice(position, 1);

    Preferences.set({ key: this.PHOTO_STORAGE, value: JSON.stringify(this.photos) });

    const filename = photo.filepath.substring(photo.filepath.lastIndexOf('/') + 1);
    await Filesystem.deleteFile({ path: filename, directory: Directory.Data });
  }

  private savePicture(photo: Photo) {
    return this.readAsBase64(photo).pipe(
      switchMap(base64Data => {
        const path = Date.now() + '.jpeg';
        return from(Filesystem.writeFile({
          path,
          data: base64Data,
          directory: Directory.Data
        })).pipe(
          map(savedFile => {
            if (this.platform.is('hybrid')) {
              // Display the new image by rewriting the 'file://' path to HTTP
              // Details: https://ionicframework.com/docs/building/webview#file-protocol
              return {
                filepath: savedFile.uri,
                webviewPath: Capacitor.convertFileSrc(savedFile.uri),
              };
            } else {
              // Use webPath to display the new image instead of base64 since it's
              // already loaded into memory
              return {
                filepath: path,
                webviewPath: photo.webPath
              };
            }
          })
        );
      })
    );
  }

  private readAsBase64(photo: Photo) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      return from(Filesystem.readFile({ path: photo.path! })).pipe(map(({ data }) => data));
    } else {
      return this.http.get(photo.webPath!, { responseType: 'blob' }).pipe(
        switchMap((blob) => this.convertBlobToBase64(blob)),
      );
    }
  }

  private convertBlobToBase64 = (blob: Blob) => new Observable<string>((observer) => {
    const reader = new FileReader();
    reader.onerror = error => observer.error(error);
    reader.onload = () => {
      observer.next(reader.result as string);
      observer.complete();
    };
    reader.readAsDataURL(blob);

    // Cleanup
    return () => {
      reader.abort();
    };
  });
}
