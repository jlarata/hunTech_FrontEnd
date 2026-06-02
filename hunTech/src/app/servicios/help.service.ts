import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HelpService {
  private _abrir = new Subject<void>();
  abrir$ = this._abrir.asObservable();
  abrir() { this._abrir.next(); }
}