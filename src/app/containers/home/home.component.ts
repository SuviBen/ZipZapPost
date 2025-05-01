import { Component } from '@angular/core';
import { IonContent, IonButton, IonTitle, IonHeader, IonIcon } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

const UIElements = [
  IonContent, IonButton, IonIcon
];
@Component({
  selector: 'app-home',
  imports: [...UIElements, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
