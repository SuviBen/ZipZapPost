import { Injectable, NgZone } from '@angular/core';
import { Auth, authState, EmailAuthProvider, GoogleAuthProvider, signInWithPopup, signOut, User, RecaptchaVerifier, signInWithPhoneNumber } from '@angular/fire/auth';
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
      // Run Firebase operations within NgZone
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
        return result.user;
      });
    } catch (error) {
      console.error('Error confirming OTP:', error);
      throw error;
    }
  }

  async connectWithGoogle() {
    return this.ngZone.runTask(async () => {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      this.currentUser = result.user;
      
      // Store user data in Firestore
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
  } 

  async signInWithEmail(email: string, password: string) {
    try {
      return this.ngZone.runTask(async () => {
        const credential = EmailAuthProvider.credential(email, password);
        const result = await signInWithPopup(this.auth, credential);
        this.currentUser = result.user;
        return result.user;
      });
    } catch (error) {
      console.error('Error signing in with email/password:', error);
      throw error;
    }
  }

  async signUpWithEmail(email: string, password: string) {
    try {
      return this.ngZone.runTask(async () => {
        const credential = EmailAuthProvider.credential(email, password);
        const result = await signInWithPopup(this.auth, credential);
        this.currentUser = result.user;
        return result.user;
      });
    } catch (error) {
      console.error('Error signing up with email/password:', error);
      throw error;
    }
  }

  async signOut() {
    return this.ngZone.runTask(async () => {
      await signOut(this.auth);
      this.currentUser = null;
    });
  }
}
