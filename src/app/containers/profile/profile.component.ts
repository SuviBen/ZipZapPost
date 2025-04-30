import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonHeader, IonList, IonItem, IonLabel, IonToolbar, IonTitle, IonButton, IonIcon, IonModal, IonRouterOutlet, IonImg, IonNav, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonSpinner, IonMenuButton } from '@ionic/angular/standalone';
import { UserProfileService, UserProfile } from '../../services/login/user-profile.service';
import { firstValueFrom, map, Observable, of } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddressService, AddressData } from '../../services/address/address.service';
import { Firestore, doc, docData } from '@angular/fire/firestore';

import { PageOneComponent } from '../modals/address-setup/page-one/page-one.component';

const UIElements = [
  IonContent, IonHeader, IonList, IonItem, IonLabel, IonToolbar, IonTitle, IonButton, 
  IonButtons, IonIcon, IonModal, IonRouterOutlet, IonImg, IonNav, IonCard, IonCardContent, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonSpinner, IonMenuButton
];

@Component({
  selector: 'app-profile',
  imports: [...UIElements, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  userProfile$: Observable<UserProfile | null>;
  firstName: Promise<string>;
  lastName: Promise<string>;
  addressData$: Observable<AddressData | null> = of(null);
  isLoading = true;
  mapReady = false;

  @ViewChild('nav') private nav!: IonNav;
  @ViewChild('modal') private modal!: IonModal;

  constructor(
    private readonly _auth: Auth,
    private userProfileService: UserProfileService,
    private addressService: AddressService,
    private firestore: Firestore,
    private router: Router
  ) {
    this.userProfile$ = this.userProfileService.getUserProfile();
    this.firstName = firstValueFrom(this.userProfile$.pipe(map(userProfile => userProfile?.firstName || '')));
    this.lastName = firstValueFrom(this.userProfile$.pipe(map(userProfile => userProfile?.lastName || '')));
    
    // Get the current user's address data
    const user = this._auth.currentUser;
    if (user) {
      const addressDocRef = doc(this.firestore, 'address-data', user.uid);
      this.addressData$ = docData(addressDocRef) as Observable<AddressData | null>;
    }
  }

  ngOnInit() {
    // Load Leaflet map after component is initialized
    this.loadMap();
  }

  async openModal() {
    setTimeout(() => {
      this.nav.setRoot(PageOneComponent);
    });
  }

  async signOut() {
    await this._auth.signOut();
    this.router.navigate(['/home']);
  }

  private loadMap() {
    // Load Leaflet CSS and JS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      this.mapReady = true;
      this.initializeMap();
    };
    document.head.appendChild(script);
  }

  private initializeMap() {
    // This will be called when the map data is available
    this.addressData$.subscribe(addressData => {
      if (addressData && addressData.latitude && addressData.longitude) {
        // Initialize the map with the user's location
        const map = (window as any).L.map('map').setView([addressData.latitude, addressData.longitude], 15);
        
        // Add the OpenStreetMap tiles
        (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Add a marker for the user's location
        (window as any).L.marker([addressData.latitude, addressData.longitude])
          .addTo(map)
          .bindPopup('Your address location')
          .openPopup();
      }
    });
  }
}