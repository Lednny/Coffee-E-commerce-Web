import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/data-access/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private _authService = inject(AuthService);
  
  currentUser: any = null;

  ngOnInit() {
    this.currentUser = this._authService.getCurrentUser();
  }
}
