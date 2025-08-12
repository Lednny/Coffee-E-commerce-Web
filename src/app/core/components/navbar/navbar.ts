import { Component, ElementRef, HostListener, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../features/auth/data-access/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('myCartDropdownButton1')
  myCartDropdownButton1!: ElementRef;
  @ViewChild("myCartDropdownButton1Btn")
  myCartDropdownButton1Btn!: ElementRef;
  @ViewChild('accountDropdownButton') 
  accountDropdownButton!: ElementRef;

  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  scrolled = false;
  isAuthenticated = false;
  currentUser: any = null;
  accountDropdownOpen = false;
  private _subscription = new Subscription();

  ngOnInit() {
    // Suscribirse a los cambios de autenticación
    this._subscription.add(
      this._authService.isAuthenticated$.subscribe(
        isAuth => {
          this.isAuthenticated = isAuth;
          this._cdr.detectChanges(); // Forzar detección de cambios
        }
      )
    );

    this._subscription.add(
      this._authService.currentUser$.subscribe(
        user => {
          this.currentUser = user;
          this._cdr.detectChanges(); // Forzar detección de cambios
        }
      )
    );
    
    // También obtener el estado inicial directamente
    this.isAuthenticated = this._authService.isAuthenticated();
    this.currentUser = this._authService.getCurrentUser();
    
    // Verificar el estado después de un breve retraso para asegurar que el AuthService se haya inicializado
    setTimeout(() => {
      this.isAuthenticated = this._authService.isAuthenticated();
      this.currentUser = this._authService.getCurrentUser();
      this._cdr.detectChanges();
    }, 100);
  }

  ngAfterViewInit() {
    if (this.myCartDropdownButton1) {
      this.myCartDropdownButton1.nativeElement.click();
    }

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (event) => {
      if (this.accountDropdownButton && !this.accountDropdownButton.nativeElement.contains(event.target)) {
        this.accountDropdownOpen = false;
      }
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.pageYOffset > 50;
  }

  toggleAccountDropdown() {
    this.accountDropdownOpen = !this.accountDropdownOpen;
  }

  navigateToLogin() {
    this.accountDropdownOpen = false;
    this._router.navigate(['/auth/login']);
  }

  navigateToSignup() {
    this.accountDropdownOpen = false;
    this._router.navigate(['/auth/signup']);
  }

  navigateToProfile() {
    this.accountDropdownOpen = false;
    this._router.navigate(['/profile']);
  }

  async signOut() {
    this.accountDropdownOpen = false;
    await this._authService.signOut();
  }

  getUserDisplayName(): string {
    if (this.isAuthenticated && this.currentUser) {
      // Priorizar username, luego id, luego email, luego nombre genérico
      const displayName = this.currentUser.username || 
                         this.currentUser.id ||           // Usar id como fallback
                         this.currentUser.name || 
                         this.currentUser.email?.split('@')[0] || 
                         'Usuario';
      return displayName;
    }
    return 'Account';
  }
}