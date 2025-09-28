import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterCredentials } from '../../data-access/auth.service';

@Component({
  selector: 'app-auth-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-sign-up.html',
  styleUrl: './auth-sign-up.css'
})
export class AuthSignUp {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  signupForm: FormGroup = this._fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    role: ['USER', [Validators.required]]
  }, {
    validators: this._passwordMatchValidator
  });

  isLoading = false;
  errorMessage = '';

onSubmit() {
  if (this.signupForm.valid) {
    this.isLoading = true;
    this.errorMessage = '';

    const { confirmPassword, ...formData } = this.signupForm.value;
    const credentials: RegisterCredentials = {
      ...formData,
      role: 'USER'
    };

    this._authService.signUp(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        setTimeout(() => {
          this._router.navigate(['/home']);
        }, 100);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al registrarse';
      }
    });
  } else {
    this._markFormGroupTouched();
  }
}

  navigateToLogin() {
    this._router.navigate(['/auth/login']);
  }

  navigateToHome() {
    this._router.navigate(['/home']);
  }

  private _markFormGroupTouched() {
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.get(key)?.markAsTouched();
    });
  }

  private _passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        switch (fieldName) {
          case 'username': return 'El nombre de usuario es requerido';
          case 'email': return 'El email es requerido';
          case 'password': return 'La contraseña es requerida';
          case 'confirmPassword': return 'Confirma tu contraseña';
          default: return 'Este campo es requerido';
        }
      }
      if (field.errors['email']) {
        return 'Ingresa un email válido';
      }
      if (field.errors['minlength']) {
        if (fieldName === 'username') {
          return 'El nombre de usuario debe tener al menos 3 caracteres';
        }
        return 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    if (fieldName === 'confirmPassword' && this.signupForm.errors?.['passwordMismatch'] && this.signupForm.get('confirmPassword')?.touched) {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }


// Add this method to fix the error
loginWithGoogle(): void {
}
}
