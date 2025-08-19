import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/data-access/auth.service';
import { Navbar } from '../../core/components/navbar/navbar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private _authService = inject(AuthService);
  
  currentUser: any = null;
  isEditing = false;
  originalUser: any = null;
  scrollAnimateElements!: NodeListOf<Element>;

  ngOnInit() {
    this.currentUser = this._authService.getCurrentUser();
    this.originalUser = { ...this.currentUser };
    
    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate');
      this.checkScrollAnimations();
    }, 100);
  }

  startEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    this.currentUser = { ...this.originalUser };
  }

  saveProfile() {
    // Implementar lógica de guardado
    this.isEditing = false;
    this.originalUser = { ...this.currentUser };
    this.showNotification('Perfil actualizado correctamente');
  }

  changePassword() {
    // Implementar cambio de contraseña
    this.showNotification('Funcionalidad próximamente');
  }

  private showNotification(message: string) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.checkScrollAnimations();
  }

  checkScrollAnimations() {
    if (!this.scrollAnimateElements) return;

    this.scrollAnimateElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('animate-visible');
      }
    });
  }
}
