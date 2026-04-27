import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient,
  User,
  Session,
  AuthResponse
} from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { BehaviorSubject, map, Observable } from 'rxjs';

//const supabase = createClient('https://your-project.supabase.co', 'sb_publishable_... or anon key')

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;
  // This holds the user object
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
    // Auto-fill the user if a session already exists on refresh
    this.supabase.auth.getUser().then(({ data }) => {
      this.currentUser.next(data.user);
    });
    // Listen to changes (Login/Logout)
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.next(session?.user ?? null);
    });
  }
    // Expose the user as an Observable for components
  get user$(): Observable<User | null> {
    return this.currentUser.asObservable();
  }


  // Helper to get current user value once
  getCurrentUser() {
    return this.currentUser.value;
  }

  /**
     * Getter for the current user session
     */
  get session(): Promise<{ data: { session: Session | null } }> {
    return this.supabase.auth.getSession();
  }

  /**
   * Sign up with Email + Password
   * With Email Confirmation ON, this creates a user but no session.
   */
  async signUp(email: string, password: string): Promise<AuthResponse> {
    return await this.supabase.auth.signUp({
      email,
      password,
      /* options: {
        // Optional: Redirect the user back to a specific page after they click the link
        emailRedirectTo: 'http://localhost:4200/login'
      } */
    });
  }

  /**
   * Log in an existing user
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    return await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    await this.supabase.auth.signOut();
  }

  /**
   * Listener for auth state changes (Login, Logout, etc.)
   * Useful for updating UI reactively
   */
  authChanges(callback: (event: any, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  get userEmail$(): Observable<string | null> {
  return this.currentUser.asObservable().pipe(
    map(user => user?.email ?? null)
  );
}
}

