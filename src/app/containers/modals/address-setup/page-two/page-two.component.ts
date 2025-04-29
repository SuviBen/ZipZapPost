import { Component, OnInit, inject } from '@angular/core';
import { IonButton, IonContent, IonImg, IonToast, IonNav } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType } from '@capacitor/camera';
import { AddressService } from '../../../../services/address/address.service';

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
  
  private nav = inject(IonNav);
  private addressService = inject(AddressService);

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
      this.isUploading = true;
      await this.addressService.uploadImage(this.imgSrc);
      this.toastMessage = 'Image uploaded successfully!';
      this.showToast = true;
      this.nav.pop();
    } catch (error) {
      console.error('Error uploading image:', error);
      this.toastMessage = 'Failed to upload image. Please try again.';
      this.showToast = true;
    } finally {
      this.isUploading = false;
    }
  }
}
