import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { AuthenticationService } from '../login/authentication.service';

export interface AddressData {
  uid: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  imageUrl?: string;
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
    
    // Check if document exists
    const docSnapshot = await getDoc(addressDocRef);
    
    const addressData: AddressData = {
      uid,
      latitude,
      longitude,
      timestamp: new Date()
    };
    
    // Use setDoc with merge option to create or update
    await setDoc(addressDocRef, addressData, { merge: true });
  }

  async uploadImage(imageUri: string): Promise<string> {
    const user = this.authService.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const uid = user.uid;
    
    // Convert the image URI to a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Create a reference to the storage location
    const storageRef = ref(this.storage, `address-images/${uid}/${Date.now()}.jpg`);
    
    // Upload the image
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    // Update the address-data document with the image URL
    const addressDocRef = doc(this.firestore, 'address-data', uid);
    await updateDoc(addressDocRef, {
      imageUrl: downloadUrl
    });
    
    return downloadUrl;
  }
} 