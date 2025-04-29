import { Routes } from '@angular/router';
import { HomeComponent } from './containers/home/home.component';
import { LoginComponent } from './containers/login/login.component';
import { MainViewComponent } from './containers/profile/main-view/main-view.component';
import { PersonalDataComponent } from './containers/login/personal-data/personal-data.component';
import { UserDashboardComponent } from './containers/dashboard/user-dashboard/user-dashboard.component';
import { authGuard } from './guards/auth.guard';
export const routes: Routes = [
    {
        path: 'dashboard',
        component: UserDashboardComponent,
        canActivate: [authGuard]
        // canActivate: [authGuard, adminGuard]
    },
    {
        path: 'personal-data',
        component: PersonalDataComponent,
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        component: MainViewComponent
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
        path: 'login',
        component: LoginComponent
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
