import { Component } from '@angular/core';
import { IonButton, IonContent, IonNav, IonLabel } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Geolocation } from '@capacitor/geolocation';

import { PageTwoComponent } from '../page-two/page-two.component';

@Component({
  selector: 'app-page-one',
  templateUrl: './page-one.component.html',
  styleUrls: ['./page-one.component.scss'],
  imports: [IonButton, IonContent, IonLabel, CommonModule],
})
export class PageOneComponent {
  position?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitudeAccuracy: number | null | undefined;
    altitude: number | null;
    speed: number | null;
    heading: number | null;
  }

  constructor(private nav: IonNav) {}

  navigateToPageTwo() {
    this.nav.push(PageTwoComponent);
  }

  async getLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.position = coordinates.coords;
  }
}
