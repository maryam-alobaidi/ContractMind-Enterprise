import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { ContractsArchive } from './pages/contracts-archive/contracts-archive';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { ContractReport } from './pages/contract-report/contract-report';
import { MainLayout } from './pages/main-layout/main-layout';

export const routes: Routes = [
   
    { path: '', redirectTo: 'login', pathMatch: 'full' },

   
    { path: 'login', component: Login },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'reset-password', component: ResetPassword },

  
    {
        path: '',
        component: MainLayout,
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'contracts-archive', component: ContractsArchive }, 
            { path: 'contract-report/:id', component: ContractReport }, ]
    },

    
    { path: '**', redirectTo: 'login' } 
];