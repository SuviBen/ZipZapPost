import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '@angular/fire/auth';
import { IonInput, IonItem, IonList, IonContent, IonTitle, IonHeader, IonButton, IonIcon, AlertController, IonLabel, IonToolbar } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { RecaptchaVerifier } from '@angular/fire/auth';
import { AuthenticationService } from '../../services/login/authentication.service';
import { Router } from '@angular/router';

const UIElements = [
  IonContent, IonInput, IonItem, IonList, IonTitle, IonHeader, IonButton, IonIcon, IonLabel, IonToolbar
];

@Component({
  selector: 'app-login',
  imports: [...UIElements, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  public readonly user$: Observable<User | null>;
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  public phoneNumber: string = '';
  public verificationCode: string = '';
  public confirmationResult: any = null;
  public showVerificationInput: boolean = false;

  constructor(
    private readonly authService: AuthenticationService,
    private alertController: AlertController,
    private router: Router
  ) {
    this.user$ = this.authService.getCurrentUser$;
  }

  ngOnInit() {
    if (this.user$) {
      this.router.navigate(['/profile']);
    }
    setTimeout(() => this.initRecaptcha(), 1000); // wait for DOM to load
  }

  private initRecaptcha() {
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (!recaptchaContainer) {
      console.error('Recaptcha container not found');
      return;
    }
    
    recaptchaContainer.innerHTML = '';

    try {
      this.recaptchaVerifier = new RecaptchaVerifier(this.authService._auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
        }
      });
      
      this.recaptchaVerifier.render()
        .catch(error => console.error('Error rendering reCAPTCHA:', error));
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!this.recaptchaVerifier) {
          throw new Error('Failed to initialize reCAPTCHA');
        }
      }

      // todo: add formatting logic
      const formattedPhoneNumber = this.phoneNumber.startsWith('+') ? 
        this.phoneNumber : `+${this.phoneNumber}`;

      this.confirmationResult = await this.authService.connectWithPhoneNumber(
        formattedPhoneNumber, 
        this.recaptchaVerifier
      );
      
      this.showVerificationInput = true;
      this.presentAlert('Verification code sent to your phone number');
      this.phoneNumber = '';
    } catch (error) {
      console.error('Failed to send verification code:', error);
      this.presentAlert('Failed to send verification code. Please try again.');
      this.initRecaptcha();
    }
  }

  async verifyPhoneNumber() {
    if (!this.verificationCode) {
      this.presentAlert('Please enter the verification code');
      return;
    }

    try {
      await this.authService.verifyPhoneNumber(
        this.confirmationResult,
        this.verificationCode
      );
      this.showVerificationInput = false;
      this.router.navigate(['/profile']);
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

  async signOut() {
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
      this.presentAlert('Failed to sign out');
    }
  }
}
