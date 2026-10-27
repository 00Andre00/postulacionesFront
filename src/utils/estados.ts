export const ESTADO_LEGIBLE: Record<string, string> = {
  pendiente_confirmacion_cv: 'CV en revisión',
  seleccionado: 'Seleccionado',
  rechazado: 'Rechazado',
  en_proceso: 'En proceso',
  contratado: 'Contratado',
  finalizado: 'Finalizado',
};

export const COLOR_ESTADO: Record<string, string> = {
  pendiente_confirmacion_cv: 'bg-secondary-container text-on-secondary-container',
  seleccionado: 'bg-primary-container text-on-primary-container',
  rechazado: 'bg-error-container text-on-error-container',
  en_proceso: 'bg-primary-container text-on-primary-container',
  contratado: 'bg-primary text-on-primary',
  finalizado: 'bg-surface-variant text-on-surface-variant',
};

export const estadoLegible = (estado: string): string => ESTADO_LEGIBLE[estado] || estado;
export const colorEstado = (estado: string): string => COLOR_ESTADO[estado] || 'bg-surface-variant text-on-surface-variant';