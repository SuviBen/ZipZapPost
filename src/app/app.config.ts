import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideIonicAngular } from '@ionic/angular/standalone';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "zip-zap-post", appId: "1:272404494518:web:8305b9cfbd329e22838e17", storageBucket: "zip-zap-post.firebasestorage.app", apiKey: "AIzaSyA-iugpa0sXdlA5hHHx5vyqjD4kaDps3z8", authDomain: "zip-zap-post.firebaseapp.com", messagingSenderId: "272404494518" })), provideAuth(() => getAuth()), provideDatabase(() => getDatabase()), provideIonicAngular({})]
};
