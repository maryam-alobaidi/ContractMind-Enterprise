import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';

export const routes: Routes = [
    {path:'',redirectTo:'login',pathMatch:'full'},

    {path:'login',component:Login},
    {path:'dashboard',component:Dashboard},
    {path:'forgot-password',component:ForgotPassword},
    {path:'reset-password',component:ResetPassword},



    {path:'**',redirectTo:'login'}//Fallback path for any non-existent page
];
