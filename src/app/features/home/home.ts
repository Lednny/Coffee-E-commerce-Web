import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from '../../features/auth/data-access/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.html',
})
export class Home implements OnInit, OnDestroy {
  private scrollAnimateElements: NodeListOf<HTMLElement> | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right');
      this.checkScrollAnimations();
    }, 100);
  }

  ngOnDestroy() {
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScrollAnimations();
  }

  private checkScrollAnimations() {
    if (!this.scrollAnimateElements) return;

    this.scrollAnimateElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('animate-in');
      }
    });
  }

  logOut() {
    this.authService.signOut();
  }
}
