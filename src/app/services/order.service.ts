import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { AuthenticationService } from './login/authentication.service';

export interface Order {
  delivered: boolean;
  recipient: string;
  sender: string;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private firestore: Firestore,
    private authService: AuthenticationService
  ) { }

  async createOrder(recipientId: string): Promise<string> {
    try {
      const user = this.authService.currentUser;
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      const orderData: Order = {
        delivered: false,
        recipient: recipientId,
        sender: user.uid,
        date: new Date()
      };
      
      const ordersRef = collection(this.firestore, 'orders');
      const docRef = await addDoc(ordersRef, orderData);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
}
