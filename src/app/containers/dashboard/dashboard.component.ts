import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonIcon, IonHeader, IonInput, IonItem, IonList, IonTitle, IonLabel, IonToolbar, IonMenuButton, IonButtons } from '@ionic/angular/standalone';
import { firstValueFrom, map, Observable } from 'rxjs';
import { UserProfile, UserProfileService } from '../../services/login/user-profile.service';
import { AuthenticationService } from '../../services/login/authentication.service';
import { RouterModule } from '@angular/router';

const UIElements = [
  IonContent, IonButton, IonIcon, IonHeader, IonInput, IonItem, IonList, IonTitle, IonLabel, IonToolbar, IonMenuButton, IonButtons
];  

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, ...UIElements, RouterModule],
})
export class DashboardComponent implements OnInit {

  userProfile$: Observable<UserProfile | null>;
  firstName: Promise<string>;
  lastName: Promise<string>;
  postOnTheWay: boolean = false;

  constructor(
    private userProfileService: UserProfileService,
    private authService: AuthenticationService
  ) { 
    this.userProfile$ = this.userProfileService.getUserProfile();
    this.firstName = firstValueFrom(this.userProfile$.pipe(map(userProfile => userProfile?.firstName || '')));
    this.lastName = firstValueFrom(this.userProfile$.pipe(map(userProfile => userProfile?.lastName || '')));
  }

  ngOnInit() {}

  async signOut() {
    await this.authService.signOut();
  }
}
