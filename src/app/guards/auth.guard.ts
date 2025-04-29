import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  return authState(auth).pipe(
    map((user) => !!user),
    tap((isLoggedIn) => {
      if (!isLoggedIn) {
        router.navigateByUrl("/login");
      }
    })
  );
};