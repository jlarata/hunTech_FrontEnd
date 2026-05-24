import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type FontSizePreference = 'small' | 'normal' | 'large';

@Component({
  selector: 'app-config-apariencia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './apariencia.html',
  styleUrls: ['./apariencia.css'],
})
export class Apariencia {
  fontSizeOptions: Array<{ value: FontSizePreference; label: string }> = [
    { value: 'small', label: 'Pequeño' },
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Grande' },
  ];

  selectedFontSize: FontSizePreference = 'normal';
  isDarkMode = false;

  get selectedFontSizeLabel() {
    return this.fontSizeOptions.find((option) => option.value === this.selectedFontSize)?.label ?? 'Normal';
  }

  constructor() {
    const savedFontSize = localStorage.getItem('fontSizePreference') as FontSizePreference | null;
    if (savedFontSize === 'small' || savedFontSize === 'normal' || savedFontSize === 'large') {
      this.selectedFontSize = savedFontSize;
    }

    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.applyFontSize();
    this.applyTheme();
  }

  setFontSize(size: string) {
    const valid = size === 'small' || size === 'normal' || size === 'large';
    const font = (valid ? (size as FontSizePreference) : 'normal');
    this.selectedFontSize = font;
    localStorage.setItem('fontSizePreference', font);
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
