import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  mailOutline, 
  locationOutline, 
  locateOutline, 
  shieldOutline, 
  mapOutline, 
  arrowForwardOutline
} from 'ionicons/icons';

// Register Ionicons
addIcons({
  'home-outline': homeOutline,
  'mail-outline': mailOutline,
  'location-outline': locationOutline,
  'locate-outline': locateOutline,
  'shield-outline': shieldOutline,
  'map-outline': mapOutline,
  'arrow-forward-outline': arrowForwardOutline
});

defineCustomElements(window);
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
