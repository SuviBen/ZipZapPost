import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonMenu, IonMenuToggle } from '@ionic/angular/standalone';
import { IonButton, IonIcon, IonHeader, IonInput, IonItem, IonLabel, IonList, IonTitle, IonToolbar, IonMenuButton, IonButtons } from '@ionic/angular/standalone';
import { IonContent } from '@ionic/angular/standalone';

const UIElements = [
  IonContent, IonButton, IonIcon, IonHeader, IonInput, IonItem, IonList, IonTitle, IonLabel, IonToolbar, IonMenu, IonMenuButton, IonButtons, IonMenuToggle
];  

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [CommonModule, RouterModule, ...UIElements],
  standalone: true,
})
export class MenuComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
