import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonHeader, IonList, IonItem, IonLabel, IonToolbar, IonTitle, IonButton, IonIcon, IonModal, IonRouterOutlet, IonImg, IonNav, IonButtons, } from '@ionic/angular/standalone';
import { UserProfileService, UserProfile } from '../../../services/login/user-profile.service';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PageOneComponent } from '../../modals/address-setup/page-one/page-one.component';

const UIElements = [
  IonContent, IonHeader, IonList, IonItem, IonLabel, IonToolbar, IonTitle, IonButton, IonButtons, IonIcon, IonModal, IonRouterOutlet, IonImg, IonNav
];

@Component({
  selector: 'app-user-dashboard',
  imports: [...UIElements, CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit {
  userProfile$: Observable<UserProfile | null>;
  firstName: Promise<string>;
  lastName: Promise<string>;

  @ViewChild('nav') private nav!: IonNav;
  @ViewChild('modal') private modal!: IonModal;

  constructor(
    private readonly _auth: Auth,
    private userProfileService: UserProfileService,
    private router: Router
  ) {
    this.userProfile$ = this.userProfileService.getUserProfile();
    this.firstName = firstValueFrom(this.userProfile$.pipe(map(userProfile => userProfile?.firstName || '')));
    this.lastName = firstValueFrom(this.userProfile$.pipe(map(userProfile => userProfile?.lastName || '')));
  }

  ngOnInit() {}

  async onWillPresent() {
    // Wait for the next tick to ensure the nav is ready
    setTimeout(() => {
      this.nav.setRoot(PageOneComponent);
    });
  }

  async signOut() {
    await this._auth.signOut();
    this.router.navigate(['/home']);
  }
}