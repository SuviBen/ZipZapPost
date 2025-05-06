import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/login/authentication.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  
  // Wait for Firebase auth to initialize by getting at least one emission from the auth state
  await firstValueFrom(authService.getCurrentUser$);
  
  const isLoggedIn = await authService.isAuthenticated();
  
  if (!isLoggedIn) {
    router.navigateByUrl("/login");
    return false;
  }
  
  return true;
};