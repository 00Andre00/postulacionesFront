<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import { useAuthStore } from '../../stores/auth.store';
import type { Postulacion } from '../../types';
import Spinner from '../../components/Spinner.vue';
import EmptyState from '../../components/EmptyState.vue';

const auth = useAuthStore();
const postulaciones = ref<Postulacion[]>([]);
const cargando = ref(true);
const error = ref('');

const cargar = async () => {
  cargando.value = true;
  error.value = '';
  try {
    const { data } = await api.get<Postulacion[]>('/postulaciones/mis-postulaciones');
    postulaciones.value = data;
  } catch {
    error.value = 'No se pudieron cargar tus postulaciones.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);

const estadoLegible = (estado: string): string => {
  const mapa: Record<string, string> = {
    pendiente_confirmacion_cv: 'CV en revisión',
    seleccionado: 'Seleccionado',
    rechazado: 'Rechazado',
    en_proceso: 'En entrevistas',
    contratado: '¡Contratado!',
    finalizado: 'Finalizado',
  };
  return mapa[estado] || estado;
};

const colorEstado = (estado: string): string => {
  const mapa: Record<string, string> = {
    pendiente_confirmacion_cv: 'bg-secondary-container text-on-secondary-container',
    seleccionado: 'bg-primary-container text-on-primary-container',
    rechazado: 'bg-error-container text-on-error-container',
    en_proceso: 'bg-primary-container text-on-primary-container',
    contratado: 'bg-primary text-on-primary',
    finalizado: 'bg-surface-variant text-on-surface-variant',
  };
  return mapa[estado] || 'bg-surface-variant text-on-surface-variant';
};

const proximaEntrevista = (p: Postulacion) => {
  if (!p.entrevistas?.length) return null;
  const ahora = Date.now();
  const futuras = p.entrevistas
    .filter((e) => new Date(e.fechaHora).getTime() >= ahora)
    .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
  return futuras[0] || null;
};
</script>

<template>
  <div class="min-h-screen bg-surface py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-on-surface">Mi panel</h1>
        <p class="text-on-surface-variant mt-1">Hola, {{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</p>
      </header>

      <Spinner v-if="cargando" />
      <div v-else-if="error" class="bg-error-container text-on-error-container p-4 rounded-card">{{ error }}</div>
      <EmptyState v-else-if="postulaciones.length === 0" titulo="Sin postulaciones" mensaje="Aún no tienes postulaciones registradas." />

      <div v-else class="space-y-6">
        <article
          v-for="p in postulaciones"
          :key="p.id"
          class="bg-surface rounded-card border border-outline-variant overflow-hidden shadow-sm"
        >
          <div class="p-6">
            <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 class="text-xl font-semibold text-on-surface">{{ p.proceso.nombre }}</h2>
                <p class="text-sm text-on-surface-variant">Postulación #{{ p.id }}</p>
              </div>
              <span :class="['px-3 py-1 rounded-button text-xs font-semibold', colorEstado(p.estado)]">
                {{ estadoLegible(p.estado) }}
              </span>
            </div>

            <div v-if="p.etapaActual" class="bg-surface-variant rounded-lg p-3 mb-4 text-sm">
              <span class="text-on-surface-variant">Etapa actual: </span>
              <span class="font-medium text-on-surface">{{ p.etapaActual.nombre }}</span>
              <span class="text-on-surface-variant"> ({{ p.etapaActual.tipo }})</span>
            </div>

            <div v-if="p.datosCV" class="border-t border-outline-variant pt-4 mt-4">
              <h3 class="text-sm font-semibold text-on-surface mb-2">Datos de tu CV</h3>
              <dl class="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt class="text-on-surface-variant">Universidad</dt>
                  <dd class="text-on-surface">{{ p.datosCV.universidad || 'No especificado' }}</dd>
                </div>
                <div>
                  <dt class="text-on-surface-variant">Profesión</dt>
                  <dd class="text-on-surface">{{ p.datosCV.profesion || 'No especificado' }}</dd>
                </div>
                <div>
                  <dt class="text-on-surface-variant">Fecha de título</dt>
                  <dd class="text-on-surface">
                    {{ p.datosCV.fechaTitulo ? new Date(p.datosCV.fechaTitulo).toLocaleDateString() : 'No especificado' }}
                  </dd>
                </div>
              </dl>
            </div>

            <div v-if="proximaEntrevista(p)" class="border-t border-outline-variant pt-4 mt-4">
              <h3 class="text-sm font-semibold text-on-surface mb-2">Próxima entrevista</h3>
              <div class="bg-primary-container border border-primary/20 rounded-lg p-4">
                <p class="font-medium text-on-primary-container">
                  📅 {{ new Date(proximaEntrevista(p)!.fechaHora).toLocaleString('es-PE', { dateStyle: 'full', timeStyle: 'short' }) }}
                </p>
                <p v-if="proximaEntrevista(p)!.descripcion" class="text-sm text-on-primary-container mt-2">
                  {{ proximaEntrevista(p)!.descripcion }}
                </p>
              </div>
            </div>

            <div v-if="p.entrevistas && p.entrevistas.length > 1" class="border-t border-outline-variant pt-4 mt-4">
              <h3 class="text-sm font-semibold text-on-surface mb-2">Historial de entrevistas</h3>
              <ul class="space-y-2 text-sm">
                <li v-for="e in p.entrevistas" :key="e.id" class="flex justify-between text-on-surface-variant gap-2">
                  <span>{{ new Date(e.fechaHora).toLocaleString('es-PE') }}</span>
                  <span class="truncate max-w-xs">{{ e.descripcion || '—' }}</span>
                </li>
              </ul>
            </div>

            <div v-if="p.estado === 'contratado'" class="mt-4 bg-primary text-on-primary rounded-lg p-4 text-sm">
              🎉 Felicidades, has sido contratado. El equipo de RRHH se pondrá en contacto contigo.
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>