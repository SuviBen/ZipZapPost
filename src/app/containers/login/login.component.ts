import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '@angular/fire/auth';
import { IonInput, IonItem, IonList, IonContent, IonTitle, IonHeader, IonButton, IonIcon, AlertController } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { RecaptchaVerifier } from '@angular/fire/auth';

const UIElements = [
  IonContent, IonInput, IonItem, IonList, IonTitle, IonHeader, IonButton, IonIcon
];

@Component({
  selector: 'app-login',
  imports: [...UIElements, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  public currentUser: User | null = null;
  public readonly user$: Observable<User | null>;
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  public phoneNumber: string = '';
  public verificationCode: string = '';
  public confirmationResult: any = null;
  public showVerificationInput: boolean = false;
  
  constructor(
    private readonly authService: AuthenticationService,
    private alertController: AlertController
  ) {
    // Use this observable with async pipe in the template
    this.user$ = this.authService.getCurrentUser$;
  }

  ngOnInit() {
    this.initRecaptcha();
  }

  private initRecaptcha() {
    // Clear any existing recaptcha elements first
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (recaptchaContainer) {
      recaptchaContainer.innerHTML = '';
    }

    try {
      // Use AngularFire's RecaptchaVerifier
      this.recaptchaVerifier = new RecaptchaVerifier(this.authService.auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // Callback runs when reCAPTCHA is solved
          console.log('reCAPTCHA verified');
        }
      });
      
      // Render the reCAPTCHA widget
      this.recaptchaVerifier.render();
    } catch (error) {
      console.error('Error initializing recaptcha:', error);
    }
  }

  async connectWithPhoneNumber() {
    if (!this.phoneNumber) {
      this.presentAlert('Please enter a phone number');
      return;
    }

    try {
      if (!this.recaptchaVerifier) {
        this.initRecaptcha();
      }

      // Format phone number with + if not already present
      const formattedPhoneNumber = this.phoneNumber.startsWith('+') ? 
        this.phoneNumber : `+${this.phoneNumber}`;

      this.confirmationResult = await this.authService.connectWithPhoneNumber(
        formattedPhoneNumber, 
        this.recaptchaVerifier!
      );
      
      this.showVerificationInput = true;
      this.presentAlert('Verification code sent to your phone number');
    } catch (error) {
      console.error('Failed to send verification code:', error);
      this.presentAlert('Failed to send verification code. Please try again.');
      // Re-initialize recaptcha for next attempt
      this.initRecaptcha();
    }
  }

  async verifyPhoneNumber() {
    if (!this.verificationCode) {
      this.presentAlert('Please enter the verification code');
      return;
    }

    try {
      this.currentUser = await this.authService.verifyPhoneNumber(
        this.confirmationResult,
        this.verificationCode
      );
      this.showVerificationInput = false;
      this.presentAlert('Successfully logged in!');
    } catch (error) {
      console.error('Failed to verify code:', error);
      this.presentAlert('Failed to verify code. Please try again.');
    }
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async connectWithGoogle() {
    try {
      this.currentUser = await this.authService.connectWithGoogle();
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
      this.presentAlert('Failed to sign in with Google');
    }
  }

  async signInWithEmail(email: string, password: string) {
    try {
      this.currentUser = await this.authService.signInWithEmail(email, password);
    } catch (error) {
      console.error('Failed to sign in with email/password:', error);
      this.presentAlert('Failed to sign in with email/password');
    }
  }

  async signUpWithEmail(email: string, password: string) {
    try {
      this.currentUser = await this.authService.signUpWithEmail(email, password);
    } catch (error) {
      console.error('Failed to sign up with email/password:', error);
      this.presentAlert('Failed to sign up with email/password');
    }
  }

  async signOut() {
    try {
      await this.authService.signOut();
      this.currentUser = null;
    } catch (error) {
      console.error('Failed to sign out:', error);
      this.presentAlert('Failed to sign out');
    }
  }
}
