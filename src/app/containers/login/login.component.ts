import { Component } from '@angular/core';
import { IonInput, IonItem, IonList, IonContent, IonTitle, IonHeader } from '@ionic/angular/standalone';

const UIElements = [
  IonContent, IonInput, IonItem, IonList, IonTitle, IonHeader
];
@Component({
  selector: 'app-login',
  imports: [...UIElements],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

}
