import { Component } from '@angular/core';
import { AuthService } from '../../servicios/AuthService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-testlogin',
  imports: [FormsModule, CommonModule],
  templateUrl: './testlogin.html',
  styleUrl: './testlogin.css',
})
export class Testlogin {
  user$: Observable<User | null>;
  loading = false;
  confirmationSent = false;
  login_email = '';
  login_password = '';
  signup_email = '';
  signup_password = '';

  constructor(private authService: AuthService) {
    // Assign the observable from the service
    this.user$ = this.authService.user$;
   }

  async handleLogin(event: Event) {
    event.preventDefault();
    this.loading = true;

    try {
      const { data, error } = await this.authService.signIn(this.login_email, this.login_password);

      if (error) throw error;

      console.log('Login successful:', data.user);
      // Navigate to dashboard or home
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      this.loading = false;
    }
  }

  async handleSignUp(event: Event) {
    event.preventDefault();
    this.loading = true;

    try {
      const { data, error } = await this.authService.signUp(this.signup_email, this.signup_password);

      if (error) throw error;

      // If email confirmation is ON, session will be null, and user might be present
      if (data.user && !data.session) {
        this.confirmationSent = true;
      }
    } catch (error: any) {
      alert(error.message || 'An error occurred during sign up.');
    } finally {
      this.loading = false;
    }
  }

  logout() {
    this.authService.signOut();
  }

}
