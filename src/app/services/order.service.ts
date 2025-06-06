import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';
import { AuthenticationService } from './login/authentication.service';

export interface Order {
  id?: string;
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

  async hasPendingOrders(): Promise<boolean> {
    try {
      const user = this.authService.currentUser;
      
      if (!user) {
        return false;
      }
      

      const ordersRef = collection(this.firestore, 'orders');     // Query for orders 
      const q = query(
        ordersRef, 
        where('recipient', '==', user.uid),
        where('delivered', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty; // this will true if matching documents
    } catch (error) {
      console.error('Error checking for pending orders:', error);
      return false;
    }
  }
}
