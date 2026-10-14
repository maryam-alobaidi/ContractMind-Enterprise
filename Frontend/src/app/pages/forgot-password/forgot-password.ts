import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  private fb=inject(FormBuilder);
  private authService=inject(Auth);


  isLoading:boolean=false;
  errorMessage:string|null=null;
  successMessage:string|null=null;


  forgotForm:FormGroup=this.fb.group({
    email:['',[Validators.required,Validators.email]]
  });

  get email(){
    return this.forgotForm.get('email');
  }

  onSubmit(){

    if(this.forgotForm.invalid){
      this.forgotForm.markAllAsTouched;
      return;
    }


    this.isLoading=true;
    this.successMessage=null;
    this.errorMessage = null;

    const emailValue = this.forgotForm.value.email;
  
    return this.authService.forgotPassword(emailValue).subscribe({
      next:(response)=>{
        this.isLoading=false;
        this.successMessage="The password reset link has been successfully sent to your email!";
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Something went wrong; please try again later.';
      }
    })
  }
}
