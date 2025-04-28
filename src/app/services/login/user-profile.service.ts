import { Injectable } from '@angular/core';
import { Firestore, doc, docData, updateDoc, getDoc } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AuthenticationService } from './authentication.service';

export interface UserProfile {
  uid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  profileOK?: boolean;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  
  constructor(
    private firestore: Firestore,
    private authService: AuthenticationService
  ) {}

  getUserProfile(): Observable<UserProfile | null> {
    return this.authService.getCurrentUser$.pipe(
      switchMap(user => {
        if (!user) {
          return of(null);
        }
        
        const userDocRef = doc(this.firestore, 'users', user.uid);
        return docData(userDocRef) as Observable<UserProfile>;
      })
    );
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<void> {
    const user = this.authService.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const userDocRef = doc(this.firestore, 'users', user.uid);
    
    if ('firstName' in data || 'lastName' in data || 'email' in data) {
      data.profileOK = true;
    }
    
    return updateDoc(userDocRef, data);
  }
} 