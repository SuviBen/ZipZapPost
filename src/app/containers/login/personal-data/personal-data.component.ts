import { CommonModule } from '@angular/common';
import { IonIcon, IonButton, IonHeader, IonItem, IonContent, IonInput, IonList, IonTitle, IonLabel } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Auth, User, authState } from '@angular/fire/auth';
import { doc, setDoc, Firestore, getFirestore, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
export class PersonalDataComponent implements OnInit {

  public name: string = '';
  public lastName: string = '';
  public email: string = '';
  public phone: string = '';
  public user$: Observable<User | null>;

  constructor(
    private readonly _auth: Auth,
  ) {
    this.user$ = authState(this._auth);
  }

  ngOnInit() {
  }

  async next() {
    const db = getFirestore();
    const uid = this._auth.currentUser!.uid;
    const userDoc = doc(db, 'users', uid);
    
    await updateDoc(userDoc, {
      name: this.name,
      lastName: this.lastName,
      email: this.email,
    });
  }
}
