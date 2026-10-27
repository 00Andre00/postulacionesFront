<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import { useAuthStore } from '../../stores/auth.store';
import type { Postulacion } from '../../types';

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

// Traduce el estado técnico a algo legible
const estadoLegible = (estado: string): string => {
  const mapa: Record<string, string> = {
    pendiente_confirmacion_cv: 'CV en revisión por el encargado',
    seleccionado: 'Seleccionado para el proceso',
    rechazado: 'Postulación rechazada',
    en_proceso: 'En proceso de entrevistas',
    contratado: '¡Contratado!',
    finalizado: 'Proceso finalizado',
  };
  return mapa[estado] || estado;
};

const colorEstado = (estado: string): string => {
  const mapa: Record<string, string> = {
    pendiente_confirmacion_cv: 'bg-yellow-100 text-yellow-800',
    seleccionado: 'bg-blue-100 text-blue-800',
    rechazado: 'bg-red-100 text-red-800',
    en_proceso: 'bg-indigo-100 text-indigo-800',
    contratado: 'bg-green-100 text-green-800',
    finalizado: 'bg-gray-100 text-gray-800',
  };
  return mapa[estado] || 'bg-gray-100 text-gray-800';
};

// Próxima entrevista (la más cercana en el futuro)
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
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Mi panel</h1>
        <p class="text-gray-600 mt-1">Hola, {{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</p>
      </header>

      <div v-if="cargando" class="text-center text-gray-500">Cargando...</div>
      <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>
      <div v-else-if="postulaciones.length === 0" class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No tienes postulaciones registradas.
      </div>

      <div v-else class="space-y-6">
        <article
          v-for="p in postulaciones"
          :key="p.id"
          class="bg-white rounded-lg shadow overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 class="text-xl font-semibold text-gray-800">{{ p.proceso.nombre }}</h2>
                <p class="text-sm text-gray-500">Postulación #{{ p.id }}</p>
              </div>
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold', colorEstado(p.estado)]">
                {{ estadoLegible(p.estado) }}
              </span>
            </div>

            <!-- Etapa actual -->
            <div v-if="p.etapaActual" class="bg-gray-50 rounded p-3 mb-4 text-sm">
              <span class="text-gray-600">Etapa actual: </span>
              <span class="font-medium text-gray-800">{{ p.etapaActual.nombre }}</span>
              <span class="text-gray-500"> ({{ p.etapaActual.tipo }})</span>
            </div>

            <!-- Datos del CV confirmados -->
            <div v-if="p.datosCV" class="border-t pt-4 mt-4">
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Datos de tu CV</h3>
              <dl class="grid gap-2 text-sm md:grid-cols-3">
                <div>
                  <dt class="text-gray-500">Universidad</dt>
                  <dd class="text-gray-800">{{ p.datosCV.universidad || 'No especificado' }}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Profesión</dt>
                  <dd class="text-gray-800">{{ p.datosCV.profesion || 'No especificado' }}</dd>
                </div>
                <div>
                  <dt class="text-gray-500">Fecha de título</dt>
                  <dd class="text-gray-800">
                    {{ p.datosCV.fechaTitulo
                      ? new Date(p.datosCV.fechaTitulo).toLocaleDateString()
                      : 'No especificado' }}
                  </dd>
                </div>
              </dl>
            </div>

            <!-- Próxima entrevista -->
            <div v-if="proximaEntrevista(p)" class="border-t pt-4 mt-4">
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Próxima entrevista</h3>
              <div class="bg-indigo-50 border border-indigo-200 rounded p-4">
                <p class="font-medium text-indigo-900">
                  📅 {{ new Date(proximaEntrevista(p)!.fechaHora).toLocaleString('es-PE', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  }) }}
                </p>
                <p v-if="proximaEntrevista(p)!.descripcion" class="text-sm text-indigo-800 mt-2">
                  {{ proximaEntrevista(p)!.descripcion }}
                </p>
              </div>
            </div>

            <!-- Historial de entrevistas pasadas -->
            <div
              v-if="p.entrevistas && p.entrevistas.length > 1"
              class="border-t pt-4 mt-4"
            >
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Historial de entrevistas</h3>
              <ul class="space-y-2 text-sm">
                <li
                  v-for="e in p.entrevistas"
                  :key="e.id"
                  class="flex justify-between text-gray-600"
                >
                  <span>{{ new Date(e.fechaHora).toLocaleString('es-PE') }}</span>
                  <span class="truncate ml-2 max-w-xs">{{ e.descripcion || '—' }}</span>
                </li>
              </ul>
            </div>

            <!-- Mensaje cuando contratado -->
            <div
              v-if="p.estado === 'contratado'"
              class="mt-4 bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm"
            >
              🎉 Felicidades, has sido contratado. El equipo de RRHH se pondrá en contacto contigo.
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>