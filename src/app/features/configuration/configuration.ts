import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    offers: boolean;
    newProducts: boolean;
  };
  preferences: {
    currency: string;
    language: string;
    theme: string;
    autoSave: boolean;
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
    marketing: boolean;
  };
}

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuration.html',
  styleUrl: './configuration.css'
})
export class Configuration implements OnInit {
  scrollAnimateElements!: NodeListOf<Element>;
  settings: UserSettings = {
    notifications: {
      email: true,
      push: false,
      offers: true,
      newProducts: false
    },
    preferences: {
      currency: 'COP',
      language: 'es',
      theme: 'light',
      autoSave: true
    },
    privacy: {
      shareData: false,
      analytics: true,
      marketing: false
    }
  };

  currencies = [
    { value: 'COP', label: 'Peso Colombiano (COP)' },
    { value: 'USD', label: 'Dólar Estadounidense (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' }
  ];

  languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' }
  ];

  themes = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'auto', label: 'Automático' }
  ];

  ngOnInit() {
    this.loadSettings();
    
    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate');
      this.checkScrollAnimations();
    }, 100);
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }

  saveSettings() {
    localStorage.setItem('userSettings', JSON.stringify(this.settings));
    this.showSuccessMessage();
  }

  resetSettings() {
    if (confirm('¿Estás seguro de que quieres restablecer todas las configuraciones?')) {
      localStorage.removeItem('userSettings');
      this.settings = {
        notifications: {
          email: true,
          push: false,
          offers: true,
          newProducts: false
        },
        preferences: {
          currency: 'COP',
          language: 'es',
          theme: 'light',
          autoSave: true
        },
        privacy: {
          shareData: false,
          analytics: true,
          marketing: false
        }
      };
      this.showSuccessMessage('Configuraciones restablecidas');
    }
  }

  exportSettings() {
    const dataStr = JSON.stringify(this.settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'coffee-web-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  importSettings(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          this.settings = { ...this.settings, ...importedSettings };
          this.saveSettings();
          this.showSuccessMessage('Configuraciones importadas correctamente');
        } catch (error) {
          alert('Error al importar el archivo. Asegúrate de que sea un archivo válido.');
        }
      };
      reader.readAsText(file);
    }
  }

  showSuccessMessage(message: string = 'Configuraciones guardadas correctamente') {
    // Aquí podrías usar un servicio de notificaciones
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
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
