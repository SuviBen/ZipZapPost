import { Routes } from '@angular/router';
import { HomeComponent } from './containers/home/home.component';
import { LoginComponent } from './containers/login/login.component';
import { PersonalDataComponent } from './containers/login/personal-data/personal-data.component';
import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './containers/profile/profile.component';
export const routes: Routes = [
    {
        path: 'personal-data',
        component: PersonalDataComponent,
        canActivate: [authGuard]
        // canActivate: [authGuard, adminGuard]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full'
    },
];
