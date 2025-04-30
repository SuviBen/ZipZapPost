import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { MenuComponent } from './containers/menu/menu.component';
import '@khmyznikov/pwa-install';
import { AppUpdateComponent } from './app-update.component';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet, MenuComponent, AppUpdateComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  title = 'Zip Zap Post';
}
