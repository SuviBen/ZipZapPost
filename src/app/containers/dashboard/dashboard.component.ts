import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonHeader, IonItem, IonList, IonTitle, IonLabel, IonToolbar, IonMenuButton, IonButtons, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { firstValueFrom, map, Observable } from 'rxjs';
import { UserProfile, UserProfileService } from '../../services/login/user-profile.service';
import { AuthenticationService } from '../../services/login/authentication.service';
import { RouterModule } from '@angular/router';
import { SendMailComponent } from '../modals/send-mail/send-mail.component';
import { OrderService } from '../../services/order.service';
import { IncomingOrdersComponent } from '../modals/incoming-orders/incoming-orders.component';


const UIElements = [
  IonContent, IonButton, IonHeader, IonItem, IonList, IonTitle, IonLabel, IonToolbar, IonMenuButton, IonButtons,
  IonRefresher, IonRefresherContent
];  

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, ...UIElements, RouterModule, SendMailComponent, IncomingOrdersComponent],
})
export class DashboardComponent implements OnInit {
  @ViewChild(IncomingOrdersComponent) incomingOrdersModal!: IncomingOrdersComponent;
  @ViewChild(SendMailComponent) sendMailModal!: SendMailComponent;

  userProfile$: Observable<UserProfile | null>;
  firstName: Promise<string>;
  lastName: Promise<string>;
  hasPendingMail: boolean = false;

  constructor(
    private userProfileService: UserProfileService,
    private authService: AuthenticationService,
    private orderService: OrderService
  ) { 
    this.userProfile$ = this.userProfileService.getUserProfile();
    this.firstName = firstValueFrom(this.userProfile$.pipe(map(userProfile => userProfile?.firstName || '')));
    this.lastName = firstValueFrom(this.userProfile$.pipe(map(userProfile => userProfile?.lastName || '')));
  }

  async ngOnInit() {
    await this.checkPendingMail();
  }

  ionViewWillEnter() {
    // Check for pending mail when returning to this page
    this.checkPendingMail();
  }

  async checkPendingMail() {
    this.hasPendingMail = await this.orderService.hasPendingOrders();
  }

  async handleRefresh(event: any) {
    // Refresh the pending mail status
    await this.checkPendingMail();
    // Complete the refresh
    event.target.complete();
  }

  async signOut() {
    await this.authService.signOut();
  }

  openIncomingOrdersModal() {
    if (this.incomingOrdersModal && this.incomingOrdersModal.modal) {
      this.incomingOrdersModal.modal.present();
    } else {
      console.error('Incoming orders modal not found');
    }
  }

  openSendMailModal() {
    if (this.sendMailModal && this.sendMailModal.modal) {
      this.sendMailModal.modal.present();
    } else {
      console.error('Send mail modal not found');
    }
  }
}
