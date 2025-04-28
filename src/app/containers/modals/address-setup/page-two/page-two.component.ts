import { Component, OnInit } from '@angular/core';
import { IonButton, IonContent, IonImg } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType } from '@capacitor/camera';

@Component({
  selector: 'app-page-two',
  templateUrl: './page-two.component.html',
  styleUrls: ['./page-two.component.scss'],
  imports: [IonButton, IonContent, IonImg, CommonModule],
})
export class PageTwoComponent implements OnInit {
  imgSrc?: string;

  constructor() { }

  ngOnInit() {}

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 95,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });
    this.imgSrc = image.webPath;
  }
}
