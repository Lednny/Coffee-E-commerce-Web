import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/data-access/auth.service';
import { AddressDTO } from '../../shared/models/address.interface';
import { BackendService } from '../../core/services/backend.service';
import { UserProfile, UserPreferences } from '../../shared/models/user.model';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuration.html',
  styleUrl: './configuration.css'
})
export class Configuration implements OnInit {
  private _authService = inject(AuthService);
  private backendService = inject(BackendService);

  scrollAnimateElements!: NodeListOf<Element>;

  // Address properties
  addresses: AddressDTO[] = [];
  showAddForm = false;
  editingAddress: AddressDTO | null = null;
  loading = false;

    newAddress: AddressDTO = {
    name: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    country: 'México',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  };
  
  // Profile properties
  currentUser: UserProfile | null = null;
  isEditingProfile = false;
  originalUser: UserProfile | null = null;
  profileLoading = false;
  
  // Settings properties
  settings: UserPreferences = {
    currency: 'MXN',
    language: 'es',
    theme: 'light',
    notifications: {
      email: true,
      push: false,
      offers: true,
      newProducts: false
    }
  };
  originalSettings: UserPreferences | null = null;
  settingsLoading = false;

  // Password change properties
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isChangingPassword = false;

  currencies = [
    { value: 'MXN', label: 'Peso Mexicano (MXN)' },
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
    // Initialize user profile and settings
    this.loadUserProfile();
    this.loadUserPreferences();
    this.loadAddresses();

    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate');
      this.checkScrollAnimations();
    }, 100);
  }

  loadUserProfile() {
    this.profileLoading = true;
    this.backendService.getUserProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.originalUser = { ...user };
        this.profileLoading = false;
        console.log('Perfil de usuario cargado:', user);
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        this.profileLoading = false;
        if (error.status === 401) {
          this.showErrorMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        }
      }
    });
  }

  loadUserPreferences() {
    this.settingsLoading = true;
    this.backendService.getUserPreferences().subscribe({
      next: (preferences) => {
        this.settings = { ...this.settings, ...preferences };
        this.originalSettings = { ...this.settings };
        this.settingsLoading = false;
        console.log('Preferencias cargadas:', preferences);
      },
      error: (error) => {
        console.error('Error cargando preferencias:', error);
        this.settingsLoading = false;
        // Si no hay preferencias guardadas, usar las por defecto
        this.originalSettings = { ...this.settings };
      }
    });
  }

    loadAddresses() {
    this.loading = true;
    this.backendService.getUserAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.loading = false;
        console.log('Direcciones cargadas:', addresses);
      },
      error: (error) => {
        console.error('Error cargando direcciones:', error);
        this.loading = false;
        
        if (error.status === 401) {
          this.showErrorMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else if (error.status === 403) {
          this.showErrorMessage('No tienes permisos para acceder a esta información.');
        } else {
          console.warn('No se pudieron cargar las direcciones del usuario.');
        }
      }
    });
  }

  saveAddress() {
    if (this.editingAddress) {
      this.updateAddress();
    } else {
      this.createAddress();
    }
  }

  createAddress() {
    if (!this.isValidAddress(this.newAddress)) {
      this.showErrorMessage('Por favor completa todos los campos requeridos');
      return;
    }

    this.loading = true;
    this.backendService.createAddress(this.newAddress).subscribe({
      next: (address) => {
        this.addresses.push(address);
        this.resetForm();
        this.loading = false;
        this.showSuccessMessage('Dirección creada exitosamente');
      },
      error: (error) => {
        console.error('Error creando dirección:', error);
        this.loading = false;
        if (error.status === 400) {
          this.showErrorMessage('Datos inválidos. Verifica la información ingresada.');
        } else if (error.status === 401) {
          this.showErrorMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else {
          this.showErrorMessage('Error al crear la dirección');
        }
      }
    });
  }

  updateAddress() {
    if (this.editingAddress?.id && this.isValidAddress(this.newAddress)) {
      this.loading = true;
      this.backendService.updateAddress(this.editingAddress.id, this.newAddress).subscribe({
        next: (address) => {
          const index = this.addresses.findIndex(a => a.id === address.id);
          if (index > -1) {
            this.addresses[index] = address;
          }
          this.resetForm();
          this.loading = false;
          this.showSuccessMessage('Dirección actualizada exitosamente');
        },
        error: (error) => {
          console.error('Error actualizando dirección:', error);
          this.loading = false;
          if (error.status === 400) {
            this.showErrorMessage('Datos inválidos. Verifica la información ingresada.');
          } else if (error.status === 401) {
            this.showErrorMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          } else {
            this.showErrorMessage('Error al actualizar la dirección');
          }
        }
      });
    }
  }

  editAddress(address: AddressDTO) {
    this.editingAddress = address;
    this.newAddress = { ...address };
    this.showAddForm = true;
  }

  deleteAddress(id: number) {
    if (confirm('¿Estás seguro de eliminar esta dirección?')) {
      this.loading = true;
      this.backendService.deleteAddress(id).subscribe({
        next: () => {
          this.addresses = this.addresses.filter(a => a.id !== id);
          this.loading = false;
          this.showSuccessMessage('Dirección eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error eliminando dirección:', error);
          this.loading = false;
          if (error.status === 401) {
            this.showErrorMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          } else {
            this.showErrorMessage('Error al eliminar la dirección');
          }
        }
      });
    }
  }

  // Validar que la dirección tenga todos los campos requeridos
  isValidAddress(address: AddressDTO): boolean {
    return !!(
      address.name?.trim() &&
      address.lastName?.trim() &&
      address.phoneNumber?.trim() &&
      address.email?.trim() &&
      address.country?.trim() &&
      address.street?.trim() &&
      address.city?.trim() &&
      address.state?.trim() &&
      address.zipCode?.trim()
    );
  }

  // Validar que el perfil tenga campos requeridos
  isValidProfile(): boolean {
    return !!(
      this.currentUser?.username?.trim() &&
      this.currentUser?.email?.trim()
    );
  }

  // Verificar si hay cambios en el perfil
  hasProfileChanges(): boolean {
    if (!this.currentUser || !this.originalUser) return false;
    return JSON.stringify(this.currentUser) !== JSON.stringify(this.originalUser);
  }

  // Verificar si hay cambios en las preferencias
  hasSettingsChanges(): boolean {
    if (!this.originalSettings) return false;
    return JSON.stringify(this.settings) !== JSON.stringify(this.originalSettings);
  }

  resetForm() {
    this.newAddress = {
      name: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      country: 'México',
      street: '',
      city: '',
      state: '',
      zipCode: ''
    };
    this.showAddForm = false;
    this.editingAddress = null;
  }

  saveSettings() {
    this.settingsLoading = true;
    this.backendService.updateUserPreferences(this.settings).subscribe({
      next: (preferences) => {
        this.originalSettings = { ...this.settings };
        this.settingsLoading = false;
        this.showSuccessMessage('Preferencias guardadas correctamente');
      },
      error: (error) => {
        console.error('Error guardando preferencias:', error);
        this.settingsLoading = false;
        if (error.status === 401) {
          this.showErrorMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else {
          this.showErrorMessage('Error al guardar las preferencias');
        }
      }
    });
  }

  resetSettings() {
    if (confirm('¿Estás seguro de que quieres restablecer todas las configuraciones?')) {
      // Resetear a las preferencias originales
      if (this.originalSettings) {
        this.settings = { ...this.originalSettings };
      } else {
        // Si no hay originales, usar las por defecto
        this.settings = {
          currency: 'MXN',
          language: 'es',
          theme: 'light',
          notifications: {
            email: true,
            push: false,
            offers: true,
            newProducts: false
          }
        };
      }
      this.showSuccessMessage('Configuraciones restablecidas');
    }
  }

  exportSettings() {
    const exportData = {
      settings: this.settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `coffee-web-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    this.showSuccessMessage('Configuraciones exportadas correctamente');
  }

  importSettings(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Validar estructura del archivo
        if (importedData.settings && typeof importedData.settings === 'object') {
          // Mergear solo los campos válidos
          this.settings = {
            currency: importedData.settings.currency || this.settings.currency,
            language: importedData.settings.language || this.settings.language,
            theme: importedData.settings.theme || this.settings.theme,
            notifications: {
              email: importedData.settings.notifications?.email ?? this.settings.notifications.email,
              push: importedData.settings.notifications?.push ?? this.settings.notifications.push,
              offers: importedData.settings.notifications?.offers ?? this.settings.notifications.offers,
              newProducts: importedData.settings.notifications?.newProducts ?? this.settings.notifications.newProducts
            }
          };
          
          // Guardar automáticamente
          this.saveSettings();
          this.showSuccessMessage('Configuraciones importadas y guardadas correctamente');
        } else {
          this.showErrorMessage('Archivo de configuración inválido');
        }
      } catch (error) {
        console.error('Error importando configuraciones:', error);
        this.showErrorMessage('Error al leer el archivo. Asegúrate de que sea un archivo válido.');
      }
    };
    reader.readAsText(file);
    
    // Limpiar el input
    event.target.value = '';
  }

  showSuccessMessage(message: string = 'Configuraciones guardadas correctamente') {
    // Aquí podrías usar un servicio de notificaciones
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

  showErrorMessage(message: string) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }

  // Profile methods
  startEditingProfile() {
    this.isEditingProfile = true;
  }

  cancelEditingProfile() {
    this.isEditingProfile = false;
    if (this.originalUser) {
      this.currentUser = { ...this.originalUser };
    }
  }

  saveProfile() {
    if (!this.currentUser) return;
    
    this.profileLoading = true;
    this.backendService.updateUserProfile(this.currentUser).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.originalUser = { ...updatedUser };
        this.isEditingProfile = false;
        this.profileLoading = false;
        this.showSuccessMessage('Perfil actualizado correctamente');
      },
      error: (error) => {
        console.error('Error actualizando perfil:', error);
        this.profileLoading = false;
        if (error.status === 401) {
          this.showErrorMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else if (error.status === 400) {
          this.showErrorMessage('Datos inválidos. Verifica la información ingresada.');
        } else {
          this.showErrorMessage('Error al actualizar el perfil');
        }
      }
    });
  }

  changePassword() {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword) {
      this.showErrorMessage('Por favor completa todos los campos');
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.showErrorMessage('Las contraseñas no coinciden');
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.showErrorMessage('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.isChangingPassword = true;
    this.backendService.changePassword({
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.showSuccessMessage('Contraseña actualizada correctamente');
      },
      error: (error) => {
        console.error('Error cambiando contraseña:', error);
        this.isChangingPassword = false;
        if (error.status === 401) {
          this.showErrorMessage('Contraseña actual incorrecta');
        } else if (error.status === 400) {
          this.showErrorMessage('Nueva contraseña inválida');
        } else {
          this.showErrorMessage('Error al cambiar la contraseña');
        }
      }
    });
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
