import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from "../../shared/models/user.model";
import { UpdateUserProfile } from "../../shared/models/user.model";
import { BackendService } from './backend.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient, private backendService: BackendService) {}

    private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('auth_token');
      return new HttpHeaders({
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      });
    }
    
    getUserProfile(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/profile`, {
            headers: this.getAuthHeaders()
        });
    }

    updateUserProfile(userData: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/profile`, userData, {
            headers: this.getAuthHeaders()
        });
    }
}