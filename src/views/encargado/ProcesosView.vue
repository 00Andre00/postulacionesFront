<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../../api/client';
import type { Proceso } from '../../types';
import Spinner from '../../components/Spinner.vue';
import EmptyState from '../../components/EmptyState.vue';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { useToastStore } from '../../stores/toast.store';

const toast = useToastStore();
const procesos = ref<Proceso[]>([]);
const cargando = ref(true);
const error = ref('');

// Confirm modal para desactivar
const modalAbierto = ref(false);
const procesoSeleccionado = ref<Proceso | null>(null);
const procesando = ref(false);

const cargar = async () => {
  cargando.value = true;
  error.value = '';
  try {
    const { data } = await api.get<Proceso[]>('/procesos/todos');
    procesos.value = data;
  } catch {
    error.value = 'No se pudieron cargar los procesos.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);

const abrirConfirmacion = (p: Proceso) => {
  procesoSeleccionado.value = p;
  modalAbierto.value = true;
};

const confirmarCambioEstado = async () => {
  if (!procesoSeleccionado.value) return;
  procesando.value = true;
  try {
    const nuevoEstado = !procesoSeleccionado.value.activo;
    await api.patch(`/procesos/${procesoSeleccionado.value.id}`, { activo: nuevoEstado });
    toast.success(nuevoEstado ? 'Proceso activado' : 'Proceso desactivado');
    modalAbierto.value = false;
    await cargar();
  } catch (e: any) {
    toast.error(e.response?.data?.error || 'Error al cambiar estado');
  } finally {
    procesando.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-surface py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <header class="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-3xl font-bold text-on-surface">Gestión de procesos</h1>
          <p class="text-on-surface-variant mt-1">Crea, edita y activa/desactiva procesos de postulación.</p>
        </div>
        <RouterLink
          to="/encargado/procesos/nuevo"
          class="px-5 py-2.5 bg-primary text-on-primary rounded-button hover:opacity-90 transition"
        >
          + Nuevo proceso
        </RouterLink>
      </header>

      <Spinner v-if="cargando" />
      <div v-else-if="error" class="bg-error-container text-on-error-container p-4 rounded-card">{{ error }}</div>
      <EmptyState
        v-else-if="procesos.length === 0"
        titulo="Sin procesos"
        mensaje="Aún no hay procesos creados. Crea el primero para empezar a recibir postulaciones."
      />

      <div v-else class="grid gap-4 md:grid-cols-2">
        <article
          v-for="p in procesos"
          :key="p.id"
          class="bg-surface rounded-card border border-outline-variant p-5 flex flex-col"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <h2 class="text-lg font-semibold text-on-surface">{{ p.nombre }}</h2>
            <span
              :class="[
                'px-3 py-1 rounded-button text-xs font-semibold whitespace-nowrap',
                p.activo ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
              ]"
            >
              {{ p.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <p class="text-sm text-on-surface-variant flex-1 line-clamp-2">{{ p.descripcion || 'Sin descripción' }}</p>

          <div class="flex gap-2 mt-4">
            <RouterLink
              :to="`/encargado/procesos/${p.id}`"
              class="flex-1 text-center px-3 py-2 bg-secondary-container text-on-secondary-container rounded-button text-sm hover:opacity-90"
            >
              Ver / editar
            </RouterLink>
            <button
              @click="abrirConfirmacion(p)"
              :class="[
                'px-3 py-2 rounded-button text-sm',
                p.activo
                  ? 'bg-error-container text-on-error-container hover:opacity-90'
                  : 'bg-primary-container text-on-primary-container hover:opacity-90'
              ]"
            >
              {{ p.activo ? 'Desactivar' : 'Activar' }}
            </button>
          </div>
        </article>
      </div>
    </div>

    <ConfirmModal
      :abierto="modalAbierto"
      :titulo="procesoSeleccionado?.activo ? 'Desactivar proceso' : 'Activar proceso'"
      :mensaje="procesoSeleccionado?.activo
        ? `El proceso '${procesoSeleccionado?.nombre}' dejará de aparecer en la lista pública. Las postulaciones existentes se conservan.`
        : `El proceso '${procesoSeleccionado?.nombre}' volverá a aparecer en la lista pública.`"
      :textoConfirmar="procesoSeleccionado?.activo ? 'Desactivar' : 'Activar'"
      :peligro="procesoSeleccionado?.activo ?? false"
      @confirmar="confirmarCambioEstado"
      @cancelar="modalAbierto = false"
    />
  </div>
</template>