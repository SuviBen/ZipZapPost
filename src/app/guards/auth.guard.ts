import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/login/authentication.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  
  const isLoggedIn = await authService.isAuthenticated();
  
  if (!isLoggedIn) {
    router.navigateByUrl("/login");
    return false;
  }
  
  return true;
};