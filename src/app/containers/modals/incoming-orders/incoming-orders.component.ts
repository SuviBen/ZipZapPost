import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonTitle, IonButton, IonButtons, IonContent, IonHeader, IonModal, IonToolbar, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { OverlayEventDetail } from '@ionic/core/components';
import { OrderService, Order } from '../../../services/order.service';
import { Firestore, collection, query, where, getDocs, doc, getDoc, DocumentData } from '@angular/fire/firestore';
import { AuthenticationService } from '../../../services/login/authentication.service';
import { format } from 'date-fns';
import { addIcons } from 'ionicons';
import { timeOutline, personOutline, refreshOutline } from 'ionicons/icons';

const UIElements = [
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonSpinner,
  IonIcon
];

@Component({
  selector: 'modal-incoming-orders',
  templateUrl: './incoming-orders.component.html',
  styleUrls: ['./incoming-orders.component.scss'],
  standalone: true,
  imports: [...UIElements, CommonModule],
})
export class IncomingOrdersComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  
  incomingOrders: Array<Order & { senderName: string }> = [];
  isLoading = false;
  noOrders = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthenticationService,
    private firestore: Firestore
  ) {
    addIcons({ timeOutline, personOutline, refreshOutline });
  }

  async ngOnInit() {}

  async ionViewWillEnter() {
    // This won't work for a modal - using willPresent instead
  }

  async onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.modal.dismiss();
    }
  }

  async closeModal() {
    this.modal.dismiss(null, 'close');
  }

  ionViewWillPresent() {
    this.loadIncomingOrders();
  }

  async loadIncomingOrders() {
    this.isLoading = true;
    this.incomingOrders = [];
    
    try {
      const user = this.authService.currentUser;
      
      if (!user) {
        this.noOrders = true;
        return;
      }

      // Get orders where current user is recipient and not delivered
      const ordersRef = collection(this.firestore, 'orders');
      const q = query(
        ordersRef, 
        where('recipient', '==', user.uid),
        where('delivered', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        this.noOrders = true;
        return;
      }
      
      // For each order, get the sender details
      const orders = await Promise.all(querySnapshot.docs.map(async docSnapshot => {
        const orderData = docSnapshot.data() as Order;
        orderData.id = docSnapshot.id;
        
        // Get sender's name
        let senderName = "Unknown sender";
        try {
          const senderRef = orderData.sender;
          if (senderRef) {
            const userDocRef = doc(this.firestore, 'users', senderRef);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data() as DocumentData;
              senderName = `${userData['firstName'] || ''} ${userData['lastName'] || ''}`.trim();
              if (!senderName) {
                senderName = userData['phoneNumber'] as string || "Unknown sender";
              }
            }
          }
        } catch (error) {
          console.error('Error getting sender details:', error);
        }
        
        return {
          ...orderData,
          senderName
        };
      }));
      
      this.incomingOrders = orders;
      this.noOrders = this.incomingOrders.length === 0;
    } catch (error) {
      console.error('Error loading incoming orders:', error);
      this.noOrders = true;
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(date: any): string {
    if (!date) return 'Unknown date';
    
    // If it's a Firebase timestamp, convert to JS Date
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    return format(jsDate, 'dd MMM yyyy');
  }

  markAsDelivered(orderId: string) {
    // TODO: Implement mark as delivered functionality
  }
}
