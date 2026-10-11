import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  private fb=inject(FormBuilder);
  private router=inject(Router);
  private authService=inject(Auth);

  loginError:string|null=null;


  loginForm:FormGroup=this.fb.group({
    email:['',[Validators.required,Validators.email]],
    password:['', [Validators.required, Validators.minLength(8)]],
    rememberDevice:[false]
  })

   ngOnInit(): void {
    const savedEmail=localStorage.getItem('rememberedEmail');
    if(savedEmail)
    {
     
      this.loginForm.patchValue({
         email:savedEmail,
         rememberDevice:true
      })
    }
  }

  get email(){
    return this.loginForm.get('email');
  }

  get password(){
    return this.loginForm.get('password');
  }


  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError = null; 
    const formValues = this.loginForm.value;

   
    if (formValues.rememberDevice) {
      localStorage.setItem('rememberedEmail', formValues.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      rememberDevice:this.loginForm.value.rememberDevice
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        this.loginError = err.error?.message || 'Invalid email or password.';
        console.error('Login Failed', err);
      }
    });
  }
}
