import { Injectable, NgZone } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut, User, RecaptchaVerifier, signInWithPhoneNumber, browserLocalPersistence, setPersistence } from '@angular/fire/auth';
import { doc, serverTimestamp } from '@angular/fire/firestore';
import { getFirestore } from '@angular/fire/firestore';
import { setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public readonly getCurrentUser$: Observable<User|null>;
  public currentUser: User | null = null;
  
  constructor(
    public readonly auth: Auth,
    private ngZone: NgZone
  ) {
    // Set persistence to LOCAL to maintain session across page reloads
    setPersistence(this.auth, browserLocalPersistence).catch(error => {
      console.error("Error setting persistence:", error);
    });
    
    // Subscribe to auth state changes within NgZone to avoid hydration issues
    this.getCurrentUser$ = authState(this.auth).pipe(
      tap(user => {
        this.ngZone.run(() => {
          this.currentUser = user;
        });
      })
    );
  }
  
  async connectWithPhoneNumber(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) {
    try {
      return this.ngZone.runTask(() => {
        return signInWithPhoneNumber(this.auth, phoneNumber, recaptchaVerifier);
      });
    } catch (error) {
      console.error('Error requesting OTP:', error);
      throw error;
    }
  }

  async verifyPhoneNumber(confirmationResult: any, verificationCode: string) {
    try {
      return this.ngZone.runTask(async () => {
        const result = await confirmationResult.confirm(verificationCode);
        this.currentUser = result.user;
        if (result.user) {
          const { uid } = result.user;
          const userDoc = doc(getFirestore(), 'users', uid);
          await setDoc(userDoc as any, {
            uid,
            lastLogin: serverTimestamp(),
            profileOK: false
          }, { merge: true });
        }
        
        return result.user;
      });
    } catch (error) {
      console.error('Error confirming OTP:', error);
      throw error;
    }
  }

  // Enhanced Google sign-in that works better with popups and zones
  async connectWithGoogle() {
    const provider = new GoogleAuthProvider();
    
    // These options help with the popup window behavior
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Remove from zone.js to avoid interference with popup handling
    return this.ngZone.runOutsideAngular(async () => {
      try {
        // Use popup method without zone.js interference
        const result = await signInWithPopup(this.auth, provider);
        
        // Re-enter zone for UI updates
        return this.ngZone.run(async () => {
          this.currentUser = result.user;
          
          if (result.user) {
            const { uid, email, displayName, photoURL } = result.user;
            const userDoc = doc(getFirestore(), 'users', uid);
            await setDoc(userDoc as any, {
              uid,
              email,
              displayName,
              photoURL,
              lastLogin: serverTimestamp()
            }, { merge: true });
          }
          
          return result.user;
        });
      } catch (error) {
        // Re-enter zone for error handling
        return this.ngZone.run(() => {
          console.error('Error signing in with Google:', error);
          throw error;
        });
      }
    });
  }

  async signOut() {
    return this.ngZone.runTask(async () => {
      await signOut(this.auth);
      this.currentUser = null;
    });
  }
}
