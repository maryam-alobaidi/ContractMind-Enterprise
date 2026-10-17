import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Theme {

  //get value  from local  storage
 isDarkMode=signal<boolean>(
  localStorage.getItem('theme')!=='light'
 );

 constructor(){
  effect(()=>{
    const dark=this.isDarkMode();
    if(dark){
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    }else{
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
  })
 }

 toggleTheme(){
  this.isDarkMode.update(val => !val);
 }

}