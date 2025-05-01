import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from '@angular/fire/storage';
import { AuthenticationService } from '../login/authentication.service';

export interface AddressData {
  uid: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  imageUrl?: string;
  storagePath?: string;
  phoneNumber?: string;
}

export interface UserData {
  uid: string;
  phoneNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private authService: AuthenticationService
  ) {}

  async saveAddressData(latitude: number, longitude: number): Promise<void> {
    const user = this.authService.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const uid = user.uid;
    const addressDocRef = doc(this.firestore, 'address-data', uid);
    
    const docSnapshot = await getDoc(addressDocRef);
    
    const addressData: AddressData = {
      uid,
      latitude,
      longitude,
      timestamp: new Date()
    };
    
    
    await setDoc(addressDocRef, addressData, { merge: true }); // Use setDoc with merge option to create or update
  }

  async uploadImage(imageUri: string): Promise<string> {
    const user = this.authService.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const uid = user.uid;
    
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    const storagePath = `address-images/${uid}/${Date.now()}.jpg`;
    
    const storageRef = ref(this.storage, storagePath);
    
    const snapshot = await uploadBytes(storageRef, blob);
    
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    const addressDocRef = doc(this.firestore, 'address-data', uid);
    await updateDoc(addressDocRef, {
      imageUrl: downloadUrl,
      storagePath: storagePath
    });
    
    return downloadUrl;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const user = this.authService.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      const addressDocRef = doc(this.firestore, 'address-data', user.uid);
      const addressDoc = await getDoc(addressDocRef);
      
      if (addressDoc.exists()) {
        const addressData = addressDoc.data() as AddressData;
        
        if (addressData.storagePath) {
          const storageRef = ref(this.storage, addressData.storagePath);
          await deleteObject(storageRef);
        } else {
          console.warn('No storage path found for image, unable to delete from storage');
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  async findUserByPhoneNumber(phoneNumber: string): Promise<UserData | null> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return {
          uid: userDoc.id,
          phoneNumber: userDoc.data()['phoneNumber']
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error finding user by phone number:', error);
      return null;
    }
  }
} 