import { Component } from '@angular/core';
import { IonContent, IonButton, IonTitle, IonHeader } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

const UIElements = [
  IonContent, IonButton,IonHeader, IonTitle
];
@Component({
  selector: 'app-home',
  imports: [...UIElements, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
