import { Component, OnInit, inject } from '@angular/core';
import { IonButton, IonContent, IonImg, IonToast, IonNav, IonModal } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType } from '@capacitor/camera';
import { AddressData, AddressService } from '../../../../services/address/address.service';
import { Auth } from '@angular/fire/auth';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { firstValueFrom, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-page-two',
  templateUrl: './page-two.component.html',
  styleUrls: ['./page-two.component.scss'],
  imports: [IonButton, IonContent, IonImg, CommonModule, IonToast],
  standalone: true
})
export class PageTwoComponent implements OnInit {
  imgSrc?: string;
  isUploading = false;
  showToast = false;
  toastMessage = '';
  addressData$: Observable<AddressData | null> = of(null);

  
  private nav = inject(IonNav);
  private addressService = inject(AddressService);

  constructor(
    private readonly _auth: Auth,
    private firestore: Firestore,
  ) {
    const user = this._auth.currentUser;
    if (user) {
      const addressDocRef = doc(this.firestore, 'address-data', user.uid);
      this.addressData$ = docData(addressDocRef) as Observable<AddressData | null>;
    }
  }

  ngOnInit() {}

  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 95,
        allowEditing: false,
        resultType: CameraResultType.Uri,
      });
      this.imgSrc = image.webPath;
    } catch (error) {
      console.error('Error taking picture:', error);
      this.toastMessage = 'Failed to take picture. Please try again.';
      this.showToast = true;
    }
  }

  async uploadImage() {
    if (!this.imgSrc) {
      this.toastMessage = 'Please take a picture first.';
      this.showToast = true;
      return;
    }
    try {
      // Check if there's already an image uploaded and delete it if exists
      const existingImageUrl = await firstValueFrom(
        this.addressData$.pipe(
          map(data => data?.imageUrl)
        )
      );
      
      if (existingImageUrl) {
        // Delete the existing image from storage before uploading a new one
        await this.addressService.deleteImage(existingImageUrl);
      }
      this.isUploading = true;
      await this.addressService.uploadImage(this.imgSrc);
      this.toastMessage = 'Image uploaded successfully!';
      this.showToast = true;
      const modalEl = document.querySelector('ion-modal');
        (modalEl as any).dismiss();
    } catch (error) {
      console.error('Error uploading image:', error);
      this.toastMessage = 'Failed to upload image. Please try again.';
      this.showToast = true;
    } finally {
      this.isUploading = false;
    }
  }
}
