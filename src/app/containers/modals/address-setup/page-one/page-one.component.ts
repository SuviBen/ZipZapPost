import { Component, inject } from '@angular/core';
import { IonButton, IonContent, IonNav, IonLabel, IonToast, } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Geolocation } from '@capacitor/geolocation';
import { AddressService } from '../../../../services/address/address.service';

import { PageTwoComponent } from '../page-two/page-two.component';

@Component({
  selector: 'app-page-one',
  templateUrl: './page-one.component.html',
  styleUrls: ['./page-one.component.scss'],
  imports: [IonButton, IonContent, IonLabel, CommonModule, IonToast, ],
  standalone: true
})
export class PageOneComponent {
  constructor(private nav: IonNav) {}
  position?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitudeAccuracy: number | null | undefined;
    altitude: number | null;
    speed: number | null;
    heading: number | null;
  }
  
  isSaving = false;
  showToast = false;
  toastMessage = '';
  

  private addressService = inject(AddressService);

  navigateToPageTwo() {
    this.nav.push(PageTwoComponent);
  }

  async getLocation() {
    try {
      this.isSaving = true;
      const coordinates = await Geolocation.getCurrentPosition();
      this.position = coordinates.coords;
      
      await this.addressService.saveAddressData(
        this.position.latitude,
        this.position.longitude
      );
      
      this.toastMessage = 'Location saved successfully!';
      this.showToast = true;
    } catch (error: any) {
      console.error('Error getting location:', error);
      this.toastMessage = 'Failed to get location. Please try again.';
      this.showToast = true;
    } finally {
      this.isSaving = false;
    }
  }
}
