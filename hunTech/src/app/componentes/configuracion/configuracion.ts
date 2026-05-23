import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
type FontSizePreference = 'small' | 'normal' | 'large';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion implements OnInit {
  menuItems = [
    { label: 'Cuenta', icon: 'person', active: false, ruta: '/configuracion/cuenta' },
    { label: 'Privacidad', icon: 'lock', active: false, ruta: '/configuracion/privacidad' },
    { label: 'Apariencia', icon: 'palette', active: true, ruta: '/configuracion' },
    { label: 'Seguridad', icon: 'shield', active: false, ruta: '/configuracion/seguridad' },
  ];

  fontSizeOptions: Array<{ value: FontSizePreference; label: string }> = [
    { value: 'small', label: 'Peque\u00f1o' },
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Grande' },
  ];

  selectedFontSize: FontSizePreference = 'normal';
  isDarkMode = false;

  get selectedFontSizeLabel() {
    return this.fontSizeOptions.find((option) => option.value === this.selectedFontSize)?.label ?? 'Normal';
  }

  ngOnInit() {
    const savedFontSize = localStorage.getItem('fontSizePreference') as FontSizePreference | null;
    if (savedFontSize === 'small' || savedFontSize === 'normal' || savedFontSize === 'large') {
      this.selectedFontSize = savedFontSize;
    }

    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.applyFontSize();
    this.applyTheme();
  }

  setFontSize(size: FontSizePreference) {
    this.selectedFontSize = size;
    localStorage.setItem('fontSizePreference', size);
    this.applyFontSize();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyFontSize() {
    document.body.classList.remove('font-small', 'font-normal', 'font-large');
    document.documentElement.classList.remove('font-small', 'font-normal', 'font-large');
    document.body.classList.add(`font-${this.selectedFontSize}`);
    document.documentElement.classList.add(`font-${this.selectedFontSize}`);
  }

  private applyTheme() {
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }
}
