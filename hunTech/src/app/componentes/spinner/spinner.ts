import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingService } from '../../servicios/loading-service';


@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class Spinner {
  constructor (public loader : LoadingService) {}

}
