import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  email: string;
  password: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private users: User[] = [
    { email: 'user@music.com', password: '123456', name: 'Usuario' }
  ];

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    const user = this.users.find(
      u => u.email === email && u.password === password
    );
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  register(email: string, password: string): boolean {
    const exists = this.users.find(u => u.email === email);
    if (exists) return false;
    const name = email.split('@')[0].split('.')[0];
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    const newUser: User = { email, password, name: capitalized };
    this.users.push(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return true;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}