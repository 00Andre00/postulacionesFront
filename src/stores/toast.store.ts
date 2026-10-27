import { defineStore } from 'pinia';
import { ref } from 'vue';

type TipoToast = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  mensaje: string;
  tipo: TipoToast;
}

export const useToastStore = defineStore('toast', () => {
  const items = ref<Toast[]>([]);
  let contador = 0;

  const mostrar = (mensaje: string, tipo: TipoToast = 'info', duracionMs = 4000) => {
    const id = ++contador;
    items.value.push({ id, mensaje, tipo });
    if (duracionMs > 0) {
      setTimeout(() => cerrar(id), duracionMs);
    }
  };

  const cerrar = (id: number) => {
    items.value = items.value.filter((t) => t.id !== id);
  };

  const success = (m: string) => mostrar(m, 'success');
  const error = (m: string) => mostrar(m, 'error', 6000);
  const info = (m: string) => mostrar(m, 'info');
  const warning = (m: string) => mostrar(m, 'warning');

  return { items, mostrar, cerrar, success, error, info, warning };
});