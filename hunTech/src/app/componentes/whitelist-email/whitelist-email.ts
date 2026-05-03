import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  CreateWhitelistEmailDto,
  EstadoWL,
  TipoUsuarioWL,
  UploadWhitelistEmailResponse,
  WhitelistEmail as WhitelistEmailRecord,
  WhitelistEmailService,
} from '../../servicios/whitelist-email';
import { Users } from '../../servicios/users';

type ToastTipo = 'success' | 'warning' | 'error' | 'info';
interface Toast {
  id: number;
  tipo: ToastTipo;
  mensaje: string;
}

@Component({
  selector: 'app-whitelist-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whitelist-email.html',
  styleUrl: './whitelist-email.css',
})
export class WhitelistEmail implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  // ----- Listado -----
  loading = false;
  emails: WhitelistEmailRecord[] = [];
  total = 0;
  page = 1;
  pageSize = 20;

  // ----- Filtros -----
  filtroEstado: EstadoWL | '' = '';
  filtroTipo: TipoUsuarioWL | '' = '';
  busqueda = '';
  private busquedaDebounce?: ReturnType<typeof setTimeout>;

  // ----- Alta individual -----
  nuevo: CreateWhitelistEmailDto = {
    email: '',
    tipo_usuario: 'desarrollador',
    observaciones: '',
  };
  guardando = false;

  // ----- Carga CSV -----
  subiendoCsv = false;
  resultadoCsv: UploadWhitelistEmailResponse | null = null;
  mostrarResultadoCsv = false;

  // ----- Toasts -----
  toasts: Toast[] = [];
  private toastIdSeq = 0;

  // ----- Opciones para selects -----
  readonly tiposUsuario: { value: TipoUsuarioWL; label: string }[] = [
    { value: 'desarrollador', label: 'Desarrollador' },
    { value: 'gerente', label: 'Gerente' },
    { value: 'institucion_educativa', label: 'Institución educativa' },
  ];
  readonly estados: { value: EstadoWL; label: string }[] = [
    { value: 'activo', label: 'Activo' },
    { value: 'revocado', label: 'Revocado' },
    { value: 'usado', label: 'Usado' },
  ];

  constructor(
    private whitelistService: WhitelistEmailService,
    private usersService: Users,
  ) {}

  ngOnInit(): void {
    this.cargarLista();
  }

  // ===================== LISTADO =====================
  cargarLista(): void {
    this.loading = true;
    this.whitelistService
      .list({
        estado: this.filtroEstado || undefined,
        tipo_usuario: this.filtroTipo || undefined,
        q: this.busqueda.trim() || undefined,
        page: this.page,
        page_size: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.emails = res.data || [];
          this.total = res.pagination?.total ?? this.emails.length;
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.showToast('error', this.extractError(err, 'No se pudo cargar la whitelist'));
        },
      });
  }

  onFiltroChange(): void {
    this.page = 1;
    this.cargarLista();
  }

  onBusquedaInput(): void {
    if (this.busquedaDebounce) clearTimeout(this.busquedaDebounce);
    this.busquedaDebounce = setTimeout(() => {
      this.page = 1;
      this.cargarLista();
    }, 350);
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroTipo = '';
    this.busqueda = '';
    this.page = 1;
    this.cargarLista();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  irPagina(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.cargarLista();
  }

  // ===================== ALTA INDIVIDUAL =====================
  guardarNuevo(form: NgForm): void {
    if (!this.nuevo.email || !this.nuevo.tipo_usuario) {
      this.showToast('error', 'Email y tipo de usuario son obligatorios');
      return;
    }

    this.guardando = true;
    const dto: CreateWhitelistEmailDto = {
      email: this.nuevo.email.trim(),
      tipo_usuario: this.nuevo.tipo_usuario,
      observaciones: this.nuevo.observaciones?.trim() || undefined,
      cargado_por: this.usersService.getUserProfileValue()?.email || undefined,
    };

    this.whitelistService.create(dto).subscribe({
      next: (res) => {
        this.guardando = false;
        if (res.warning) {
          this.showToast('warning', res.warning || 'Email actualizado (ya existía)');
        } else {
          this.showToast('success', res.message || 'Email agregado a la whitelist');
        }
        this.resetForm(form);
        this.page = 1;
        this.cargarLista();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.showToast('error', this.extractError(err, 'No se pudo crear el email'));
      },
    });
  }

  resetForm(form?: NgForm): void {
    this.nuevo = { email: '', tipo_usuario: 'desarrollador', observaciones: '' };
    form?.resetForm({ email: '', tipo_usuario: 'desarrollador', observaciones: '' });
  }

  // ===================== CARGA CSV =====================
  abrirSelectorCsv(): void {
    this.fileInput?.nativeElement.click();
  }

  onCsvSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!/\.csv$/i.test(file.name)) {
      this.showToast('error', 'El archivo debe ser .csv');
      input.value = '';
      return;
    }

    this.subiendoCsv = true;
    const cargadoPor = this.usersService.getUserProfileValue()?.email || undefined;
    this.whitelistService.uploadCsv(file, cargadoPor).subscribe({
      next: (res) => {
        this.subiendoCsv = false;
        this.resultadoCsv = res;
        this.mostrarResultadoCsv = true;

        const partes: string[] = [];
        if (res.success?.count) partes.push(`${res.success.count} nuevos`);
        if (res.warnings?.count) partes.push(`${res.warnings.count} actualizados`);
        if (res.errores?.count) partes.push(`${res.errores.count} con error`);
        const resumen = partes.length ? partes.join(', ') : 'Sin cambios';

        const tipo: ToastTipo = res.errores?.count
          ? 'warning'
          : res.warnings?.count
          ? 'warning'
          : 'success';
        this.showToast(tipo, `CSV procesado: ${resumen}`);
        this.page = 1;
        this.cargarLista();
        input.value = '';
      },
      error: (err: HttpErrorResponse) => {
        this.subiendoCsv = false;
        this.showToast('error', this.extractError(err, 'Error al subir el CSV'));
        input.value = '';
      },
    });
  }

  cerrarResultadoCsv(): void {
    this.mostrarResultadoCsv = false;
    this.resultadoCsv = null;
  }

  // ===================== TOASTS =====================
  showToast(tipo: ToastTipo, mensaje: string, durationMs = 4500): void {
    const id = ++this.toastIdSeq;
    this.toasts.push({ id, tipo, mensaje });
    setTimeout(() => this.dismissToast(id), durationMs);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  trackToast = (_: number, t: Toast) => t.id;
  trackEmail = (_: number, e: WhitelistEmailRecord) => e.id ?? e.email;

  // ===================== HELPERS =====================
  private extractError(err: HttpErrorResponse, fallback: string): string {
    return (
      err?.error?.error ||
      err?.error?.message ||
      err?.message ||
      fallback
    );
  }

  labelTipo(tipo: TipoUsuarioWL | string): string {
    return this.tiposUsuario.find((t) => t.value === tipo)?.label || tipo;
  }
}
