import { CommonModule } from '@angular/common';
import { IonIcon, IonButton, IonHeader, IonItem, IonContent, IonInput, IonList, IonTitle, IonLabel } from '@ionic/angular/standalone';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { UserProfile, UserProfileService } from '../../../services/login/user-profile.service';

const UIElements = [
  IonContent, IonInput, IonItem, IonList, IonTitle, IonHeader, IonButton, IonIcon, IonLabel,
];

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.scss'],
  imports: [
    ...UIElements, 
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
  ],
  standalone: true
})
export class PersonalDataComponent {
  profileForm: FormGroup;
  userProfile$: Observable<UserProfile | null>;
  isLoading = true;

  constructor(
    private readonly _auth: Auth,
    private userProfileService: UserProfileService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [{ value: '', disabled: true }]
    });
    
    this.userProfile$ = this.userProfileService.getUserProfile().pipe(
      tap(profile => {
        if (profile) {
          this.isLoading = false;
          this.patchFormValues(profile);
        }
      })
    );
  }
  
  private patchFormValues(profile: UserProfile): void {
    this.profileForm.patchValue({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phoneNumber: profile.phoneNumber || ''
    });
  }

  async saveProfile() {
    if (this.profileForm.valid) {
      try {
        await this.userProfileService.updateUserProfile(this.profileForm.value);
        this.router.navigate(['/profile']);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  }
// Implement sign out logic if the did not complete the profile setup
  async signOut() {
    await signOut(this._auth);
    this.router.navigate(['/login']);
  }
}
