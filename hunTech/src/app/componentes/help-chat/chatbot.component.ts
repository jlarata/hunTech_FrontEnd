import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpService } from '../../servicios/help.service';

@Component({
  selector: 'app-help-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class HelpChatComponent implements AfterViewChecked {
  isOpen = false;
  historial: { type: 'bot' | 'user', text: string }[] = [];
  private shouldScroll = false;
  isTyping = false;
  nodoActual: any = null;
  nodoAnterior: any = null;

constructor(private helpService: HelpService) {
  this.nodoActual = this.arbol;
  this.helpService.abrir$.subscribe(() => {
    this.isOpen = true;
    this.reiniciar();
  });
}

  @ViewChild('bodyRef') bodyRef!: ElementRef<HTMLDivElement>;

  ngAfterViewChecked() {
    if (this.shouldScroll && this.bodyRef) {
      const el = this.bodyRef.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  readonly arbol: any = {
    id: 'inicio',
    msg: '¡Hola!, Soy Ciro, tu asistente virtual. ¿Cómo puedo ayudarte hoy?',
    opciones: [
      {
        texto: 'Soy desarrollador / estudiante',
        siguiente: {
          id: 'dev',
          msg: '¿Qué necesitás saber?',
          opciones: [
            { texto: 'Cómo completar mi perfil', siguiente: { id: 'fin', msg: 'Andá a la sección perfil y completá tu información personal, habilidades, idiomas y subí tu portfolio.' } },
            { texto: 'Cómo postularme a una oferta', siguiente: { id: 'fin', msg: 'Entrá a la sección "buscar empleo" , buscá una oferta que te interese y hacé clic en "Postularme Ahora". Necesitás tener el perfil completo para postularte.' } },
            { texto: 'Cómo subir mi currículum', siguiente: { id: 'fin', msg: 'Andá a tu perfil, sección "Información personal". Clickeá donde dice "subí tu curriculum", se desplegará una ventana para subir tu CV en PDF.' } },
            { texto: 'Cómo cambiar mi disponibilidad', siguiente: { id: 'fin', msg: 'En tu perfil, en la barra lateral izquierda, cambiá el selector de estatus.' } },
            { texto: 'Cómo personalizar la plataforma', siguiente: { id: 'fin', msg:  'Abrí el menú desplegable, seleccioná "Configuración" y luego ingresá a "Apariencia". Desde allí podrás activar el modo oscuro o cambiar el tamaño de la letra para adaptar la interfaz a tus preferencias.' } },
           {texto: 'Como subir mi portfolio', siguiente: {id: 'fin', msg: 'Andá a tu perfil, sección "Portfolio", tocá el botón "crear portfolio" y luego completá el formulario con los datos correspondientes. Finalmente clickeá el botón "Guardar Portfolio."' } },
          ]
        }
      },
      {
        texto: 'Soy empresa / gerente',
        siguiente: {
          id: 'gerente',
          msg: '¿En qué te puedo ayudar?',
          opciones: [
            { texto: 'Cómo crear una oferta laboral', siguiente: { id: 'fin', msg: 'Primero completá tu perfil. Luego andá a "Mis ofertas" y hacé clic en "Nueva oferta".' } },
            { texto: 'Cómo ver mis ofertas', siguiente: { id: 'fin', msg: 'Andá a "Ver mis contratos", buscá la oferta y hacé clic en "Ver detalles".' } },
            { texto: 'Cómo completar el perfil de empresa', siguiente: { id: 'fin', msg: 'Andá a tu perfil y hacé clic en "Editar perfil" y completá con los datos correspondientes' } },
            { texto: 'Cómo eliminar una oferta', siguiente: { id: 'fin', msg: 'En "Mis ofertas", cada oferta tiene un menú de tres puntos (⋮). Hacé clic ahí y seleccioná "Eliminar oferta".' } },
            { texto: 'Cómo personalizar la plataforma', siguiente: { id: 'fin', msg:  'Abrí el menú desplegable, seleccioná "Configuración" y luego ingresá a "Apariencia". Desde allí podrás activar el modo oscuro o cambiar el tamaño de la letra para adaptar la interfaz a tus preferencias.' } }
          ]
        }
      }
    ]
  };

  abrir() { this.isOpen = true; this.reiniciar(); }

  cerrarOverlay(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('help-overlay')) this.isOpen = false;
  }

  cerrar() { this.isOpen = false; }

  elegirOpcion(opcion: any) {
    this.historial.push({ type: 'bot', text: this.nodoActual.msg });
    this.historial.push({ type: 'user', text: opcion.texto });
    this.nodoAnterior = this.nodoActual;
    this.isTyping = true;
    this.shouldScroll = true;
    setTimeout(() => {
      this.isTyping = false;
      this.nodoActual = opcion.siguiente;
      this.shouldScroll = true;
      this.playBeep();
    }, 900);
  }

  reiniciar() {
    this.historial = [];
    this.nodoActual = this.arbol;
    this.nodoAnterior = null;
  }

volverAtras() {
  if (this.nodoActual.id === 'fin') {
    this.historial.push({ type: 'bot', text: this.nodoActual.msg });
  }
  this.nodoActual = this.nodoAnterior;
  this.nodoAnterior = null;
}
  private playBeep() {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 520;
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.18);
  }
}