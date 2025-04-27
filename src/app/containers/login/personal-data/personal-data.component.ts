import { CommonModule } from '@angular/common';
import { IonIcon, IonButton, IonHeader, IonItem, IonContent, IonInput, IonList, IonTitle, IonLabel } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Auth, User } from '@angular/fire/auth';
import { doc, setDoc, Firestore, getFirestore, updateDoc } from '@angular/fire/firestore';

const UIElements = [
  IonContent, IonInput, IonItem, IonList, IonTitle, IonHeader, IonButton, IonIcon, IonLabel,
];


@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.scss'],
  imports: [
    ...UIElements, 
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class PersonalDataComponent  implements OnInit {

  public name: string = '';
  public lastName: string = '';
  public email: string = '';
  public phone: string = '';
  public user$?: User | null;

  constructor(
    private readonly _auth: Auth,
  ) { }

  ngOnInit() {
    this.user$ = this._auth.currentUser;
  }

  next() {
    const db = getFirestore();
    const userDoc = doc(db, 'users', this._auth.currentUser?.uid as string);
    updateDoc(userDoc, {
      name: this.name,
      lastName: this.lastName,
      email: this.email,
    });
    console.log(this._auth.currentUser?.phoneNumber)
  }

}
