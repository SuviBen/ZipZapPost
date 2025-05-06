import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonModal, IonTitle, IonToolbar, } from '@ionic/angular/standalone';
import { OverlayEventDetail } from '@ionic/core/components';
import { AddressService, UserData } from '../../../services/address/address.service';
import { OrderService } from '../../../services/order.service';
import { LoadingController, ToastController } from '@ionic/angular/standalone';

const UIElements = [
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonModal,
  IonTitle,
  IonToolbar,
  IonLabel,
];

@Component({
  selector: 'modal-send-mail',
  templateUrl: './send-mail.component.html',
  styleUrls: ['./send-mail.component.scss'],
  imports: [...UIElements, FormsModule],
})
export class SendMailComponent {
  @ViewChild(IonModal) modal!: IonModal;
  phoneNumber: string = '+41';
  invalidPhoneNumber: boolean = false;
  recipient: UserData | null = null;

  constructor(
    private addressService: AddressService,
    private orderService: OrderService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  resetForm() {
    this.phoneNumber = '+41';
    this.recipient = null;
    this.invalidPhoneNumber = false;
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
    this.resetForm();
  }

  confirm() {
    this.modal.dismiss(this.phoneNumber, 'confirm');
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.modal.dismiss(this.phoneNumber, 'confirm');
    }
  }

  async checkPhoneNumber() {
    if (this.phoneNumber && this.phoneNumber.length > 3) {
      this.recipient = await this.addressService.findUserByPhoneNumber(this.phoneNumber);
      this.invalidPhoneNumber = false;
      if (!this.recipient) {
        this.invalidPhoneNumber = true;
      }
    } else if (!this.recipient) {
      this.recipient = null;
    }
  }

  async createOrder() {
    if (!this.recipient) {
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Creating order...',
      spinner: 'circles'
    });
    await loading.present();

    const orderId = await this.orderService.createOrder(this.recipient.uid);
    
    await loading.dismiss();
    
    const toast = await this.toastController.create({
      message: 'Mail order created successfully!',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });

    await toast.present();
    
    this.modal.dismiss(orderId, 'confirm');
    this.resetForm();
  }
}
