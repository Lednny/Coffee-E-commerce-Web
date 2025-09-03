import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class Contacto implements OnInit, OnDestroy {
  private scrollAnimateElements: NodeListOf<HTMLElement> | null = null;

  // Modelo para el formulario de contacto
  contactForm = {
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  };

  ngOnInit() {
    setTimeout(() => {
      this.scrollAnimateElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right');
      this.checkScrollAnimations();
    }, 100);
  }

  ngOnDestroy() {
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

  onSubmit() {
    // Validar que los campos requeridos estén llenos
    if (!this.contactForm.nombre || !this.contactForm.email || !this.contactForm.asunto || !this.contactForm.mensaje) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    // Crear el mensaje para WhatsApp
    const mensaje = this.crearMensajeWhatsApp();
    
    // Número de WhatsApp
    const numeroWhatsApp = '529932167872'; 
    
    // Crear URL de WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    // Abrir WhatsApp en una nueva ventana
    window.open(urlWhatsApp, '_blank');
    
    // Mostrar mensaje de confirmación
    alert('¡Gracias por contactarnos! Te hemos redirigido a WhatsApp para enviar tu mensaje.');
    
    // Resetear el formulario
    this.contactForm = {
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: ''
    };
  }

  private crearMensajeWhatsApp(): string {
    const fecha = new Date().toLocaleDateString('es-MX');
    const hora = new Date().toLocaleTimeString('es-MX');
    
return ` *NUEVO CONTACTO - CREDENZZA* 

*Fecha:* ${fecha}
*Hora:* ${hora}

*Datos del Cliente:*
• *Nombre:* ${this.contactForm.nombre}
• *Email:* ${this.contactForm.email}
• *Teléfono:* ${this.contactForm.telefono || 'No proporcionado'}

*Consulta:*
• *Asunto:* ${this.contactForm.asunto}

*Mensaje:*
${this.contactForm.mensaje}

---
_Mensaje enviado desde la web de Credenzza_`;
  }
}
