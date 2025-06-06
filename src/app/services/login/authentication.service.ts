import { Injectable } from '@angular/core';
import { Auth, authState, signOut, User, RecaptchaVerifier, signInWithPhoneNumber } from '@angular/fire/auth';
import { doc, serverTimestamp, updateDoc, getDoc, collection, query, Firestore, collectionData } from '@angular/fire/firestore';
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
    return signInWithPhoneNumber(this._auth, phoneNumber, recaptchaVerifier);
  }

  async verifyPhoneNumber(confirmationResult: any, verificationCode: string) {
    const result = await confirmationResult.confirm(verificationCode);
    this.currentUser = result.user;

    if (!result.user) return null;
    
    const uid = result.user.uid;
    const userDoc = doc(this._firestore, 'users', uid);
    const userSnapshot = await getDoc(userDoc);
    
    if (!userSnapshot.exists()) {
      await setDoc(userDoc, {
        uid,
        lastLogin: serverTimestamp(),
        phoneNumber: result.user.phoneNumber,
        profileOK: false
      });

      this.router.navigate(['/personal-data']);
    } else {
      await updateDoc(userDoc, {
        lastLogin: serverTimestamp()
      });
      
      await this.checkUserDataOK();
    }
    
    return result.user;
  }

  async signOut() {
    await signOut(this._auth);
    this.currentUser = null;
    this.router.navigate(['/home']);
  }

  async checkUserDataOK() {
    const uid = this.currentUser?.uid;
    if (!uid) {
      return;
    }
    const userDoc = doc(this._firestore, 'users', uid);
    const userSnapshot = await getDoc(userDoc);
    const userData = userSnapshot.data();
    if (!userData || userData['profileOK'] === false) {   // Navigate based on profile status
      this.router.navigate(['/personal-data']);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (this.currentUser === null) {
      return false;
    }
    
    try {
      const uid = this.currentUser.uid;
      const userDoc = doc(this._firestore, 'users', uid);
      const userSnapshot = await getDoc(userDoc);
      
      return userSnapshot.exists();
    } catch (error) {
      console.error('Error checking user authentication:', error);
      return false;
    }
  }
}
