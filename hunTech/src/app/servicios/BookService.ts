import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private showBookModalSubject = new BehaviorSubject<boolean>(false);
  showBookModal$ = this.showBookModalSubject.asObservable();

  /* ---- libro de info---- */
  bookSpread = 0;
  bookFlipState: 'idle' | 'forward' = 'idle';
  bookAnimating = false;
  bookSpreads = [[-1, 0], [1, 2], [3, 4], [5, 6], [7, -1]];
  bookPages = [
    { isCover: true, title: 'Edición 2026', body: 'Plataforma líder en Talento IT', bg: '#300a6e' },
    { label: 'HunTech', title: '¿Qué es HunTech?', body: 'Nuestro objetivo es facilitar el contacto con empresas que valoran la innovación, la curiosidad y el potencial de los estudiantes de IT.', bg: '#f5f3ff' },
    { label: 'Para vos', title: 'Tu perfil, tu marca', body: 'Completá tu perfil y destacate ante cientos de reclutadores activos.', bg: '#eff6ff' },
    { label: 'Empresas', title: 'Talento a un click', body: 'Publicá ofertas y encontrá al desarrollador que tu equipo necesita.', bg: '#f0fdf4' },
    { label: 'Contratos', title: 'Gestión Simple', body: 'Seguí tus procesos de contratación en tiempo real con transparencia total.', bg: '#ecfeff' },
    { label: 'Comunidad', title: 'Crecé con nosotros', body: 'Accedé a recursos y una comunidad de profesionales de tecnología.', bg: '#fff7ed' },
    { label: 'Futuro', title: 'Próximos Pasos', body: 'Estamos trabajando en nuevas herramientas de IA para potenciar tu búsqueda laboral.', bg: '#fdf2f8' },
    { isBackCover: true, title: '', body: '', bg: '#1e1040' }
  ];

  toggleBookModal() {
    this.showBookModalSubject.next(!this.showBookModalSubject.value);
  }

  closeBookModal() {
    this.showBookModalSubject.next(false);
  }

  bookNext() {
    if (this.bookSpread >= this.bookSpreads.length - 1 || this.bookAnimating) return;
    this.bookAnimating = true;
    this.bookFlipState = 'forward';
    setTimeout(() => {
      this.bookSpread++;
      this.bookFlipState = 'idle';
      setTimeout(() => { this.bookAnimating = false; }, 50);
    }, 650);
  }

  bookPrev() {
    if (this.bookSpread <= 0 || this.bookAnimating) return;
    this.bookAnimating = true;
    this.bookSpread--;
    setTimeout(() => { this.bookAnimating = false; }, 100);
  }
}
