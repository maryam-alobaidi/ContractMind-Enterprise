import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { UploadModal } from './pages/upload-modal/upload-modal';
import { ContractReport } from './pages/contract-report/contract-report';

export const routes: Routes = [
    {path:'',redirectTo:'login',pathMatch:'full'},

    {path:'login',component:Login},
    {path:'dashboard',component:Dashboard},
    {path:'forgot-password',component:ForgotPassword},
    {path:'reset-password',component:ResetPassword},
    {path:'upload-modal',component:UploadModal},
    {path:'contract-report/:id',component:ContractReport},


    {path:'**',redirectTo:'login'}//Fallback path for any non-existent page
];
