import { Component } from '@angular/core';
import { AuthService } from '../../features/auth/data-access/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Navbar } from '../../core/components/navbar/navbar';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, Navbar],
  templateUrl: './home.html',
})
export class Home {
  constructor(private authService: AuthService, private router: Router) {}

  logOut() {
    this.authService.signOut();
  }


}
