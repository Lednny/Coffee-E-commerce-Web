import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from "../../shared/models/user.model";
import { UpdateUserProfile } from "../../shared/models/user.model";

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8080/api/cart';

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/profile`);
  }

  // Actualizar perfil del usuario
  updateUserProfile(userData: UpdateUserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/users/profile`, userData);
  }
}