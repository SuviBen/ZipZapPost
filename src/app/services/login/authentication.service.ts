import { Injectable } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut, User, RecaptchaVerifier, signInWithPhoneNumber } from '@angular/fire/auth';
import { doc, serverTimestamp, getFirestore, updateDoc, getDoc, collection, query, Firestore, collectionData } from '@angular/fire/firestore';
import { setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public readonly getCurrentUser$: Observable<User|null>;
  public currentUser: User | null = null;
  public readonly data$: Observable<any[]>;
  
  constructor(
    public readonly _auth: Auth,
    public readonly _firestore: Firestore,
    private router: Router
  ) {
    this.getCurrentUser$ = authState(this._auth).pipe(
      tap(user => {
        this.currentUser = user;
      })
    );
    const collectionRef = collection(this._firestore, 'users');
    const q = query(collectionRef);
    this.data$ = collectionData(q) as Observable<any[]>;
  }
  
  async connectWithPhoneNumber(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) {
    try {
      return signInWithPhoneNumber(this._auth, phoneNumber, recaptchaVerifier);
    } catch (error) {
      console.error('Error requesting OTP:', error);
      throw error;
    }
  }

  async verifyPhoneNumber(confirmationResult: any, verificationCode: string) {
    try {
      const result = await confirmationResult.confirm(verificationCode);
      this.currentUser = result.user;
      if (result.user) {
        const uid = result.user.uid;
        const userDoc = doc(this._firestore, 'users', uid);
        
        // Check if the user document exists
        const userSnapshot = await getDoc(userDoc);
        
        if (!userSnapshot.exists()) {
          // User doesn't exist, create new document
          await setDoc(userDoc, {
            uid,
            lastLogin: serverTimestamp(),
            phoneNumber: result.user.phoneNumber,
            profileOK: false
          });
          console.log('went through first if');
          // Redirect to personal data page for new users
          this.router.navigate(['/personal-data']);
        } else {
          // User exists, update last login
          await updateDoc(userDoc, {
            lastLogin: serverTimestamp()
          });
          
          // Check profileOK flag and redirect accordingly
          const userData = userSnapshot.data();
          try {
            if (!userData) {
              throw new Error('User data is empty');
            }
            
            if (userData['profileOK'] === false) {
              this.router.navigate(['/personal-data']);
            } else {
              this.router.navigate(['/home']);
            }
          } catch (err) {
            console.error('Error checking profileOK status:', err);
            // Default to personal-data if there's any issue
            this.router.navigate(['/personal-data']);
          }
        }
      }
      
      return result.user;
    } catch (error) {
      console.error('Error confirming OTP:', error);
      throw error;
    }
  }

  async signOut() {
    await signOut(this._auth);
    this.currentUser = null;
    this.router.navigate(['/home']);
  }
}
