import { Injectable } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut, User, RecaptchaVerifier, signInWithPhoneNumber } from '@angular/fire/auth';
import { doc, serverTimestamp, getFirestore } from '@angular/fire/firestore';
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
    public readonly auth: Auth
  ) {
    this.getCurrentUser$ = authState(this.auth).pipe(
      tap(user => {
        this.currentUser = user;
      })
    );
  }
  
  async connectWithPhoneNumber(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) {
    try {
      return signInWithPhoneNumber(this.auth, phoneNumber, recaptchaVerifier);
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
        const { uid } = result.user;
        const db = getFirestore();
        const userDoc = doc(db, 'users', uid);
        await setDoc(userDoc as any, {
          uid,
          lastLogin: serverTimestamp(),
          phoneNumber: result.user.phoneNumber,
          profileOK: false
        }, { merge: true });
      }
      
      return result.user;
    } catch (error) {
      console.error('Error confirming OTP:', error);
      throw error;
    }
  }

  async connectWithGoogle() {
    const provider = new GoogleAuthProvider();
    
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      const result = await signInWithPopup(this.auth, provider);
      this.currentUser = result.user;
      
      if (result.user) {
        const { uid, email, displayName, photoURL } = result.user;
        const db = getFirestore();
        const userDoc = doc(db, 'users', uid);
        await setDoc(userDoc as any, {
          uid,
          email,
          displayName,
          photoURL,
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
      
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async signOut() {
    await signOut(this.auth);
    this.currentUser = null;
  }
}
