import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { ContractsArchive } from './pages/contracts-archive/contracts-archive';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { ContractReport } from './pages/contract-report/contract-report';
import { MainLayout } from './pages/main-layout/main-layout';
import { AiLegalAssistant } from './pages/ai-legal-assistant/ai-legal-assistant';
import { AuditLogs } from './pages/audit-logs/audit-logs';

export const routes: Routes = [
    
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    { path: 'login', component: Login },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'reset-password', component: ResetPassword },

    {
        path: '',
        component: MainLayout,
        children: [
           
            { path: 'contracts-archive', component: ContractsArchive }, 
            { path: 'contract-report/:id', component: ContractReport },
            { path: 'ai-legal-assistant', component: AiLegalAssistant },        
            { path: 'ai-legal-assistant/:id', component: AiLegalAssistant },
            { path: 'audit-logs',component:AuditLogs}    
        ]
    },

    { path: '**', redirectTo: 'login' } 
];