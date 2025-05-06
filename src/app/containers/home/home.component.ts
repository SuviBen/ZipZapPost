import { Component, OnInit } from '@angular/core';
import { IonContent, IonButton, IonTitle, IonHeader, IonIcon, IonToolbar, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../../services/login/authentication.service';
import { Observable, from, map, of, switchMap } from 'rxjs';
import { User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

const UIElements = [
  IonContent, IonButton, IonIcon, IonTitle, IonHeader, IonToolbar, IonButtons, IonMenuButton
];
@Component({
  selector: 'app-home',
  imports: [...UIElements, RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  private readonly user$: Observable<User | null>;
  public isLoggedIn$: Observable<boolean>;
  
  constructor(private authService: AuthenticationService) { 
    this.user$ = this.authService.getCurrentUser$;
    // Initialize isLoggedIn$ with a stream that checks authentication status
    this.isLoggedIn$ = this.user$.pipe(
      switchMap(user => {
        if (!user) {
          return of(false);
        }
        // Convert the Promise from isAuthenticated to an Observable
        return from(this.authService.isAuthenticated());
      })
    );
  }
  
  ngOnInit() {
    // No need to recreate isLoggedIn$ here as it's properly initialized in constructor
  }
}
