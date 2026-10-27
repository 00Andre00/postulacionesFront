<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../../api/client';
import type { Postulacion } from '../../types';

const postulaciones = ref<Postulacion[]>([]);
const cargando = ref(true);
const error = ref('');

// Modal de avance de etapa
const modalAbierto = ref(false);
const postulacionSeleccionada = ref<Postulacion | null>(null);
const fechaHora = ref('');
const descripcion = ref('');
const enviando = ref(false);
const errorModal = ref('');

const cargar = async () => {
  cargando.value = true;
  error.value = '';
  try {
    const { data } = await api.get<Postulacion[]>('/postulaciones/aceptadas');
    postulaciones.value = data;
  } catch {
    error.value = 'No se pudieron cargar las postulaciones aceptadas.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);

const abrirModal = (p: Postulacion) => {
  postulacionSeleccionada.value = p;
  fechaHora.value = '';
  descripcion.value = '';
  errorModal.value = '';
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
  postulacionSeleccionada.value = null;
};

const avanzar = async () => {
  if (!postulacionSeleccionada.value) return;
  errorModal.value = '';

  // Si la siguiente etapa es entrevista/técnica, exigir fecha
  const necesitaFecha = ['entrevista', 'tecnica'].includes(
    proximaEtapaTipo(postulacionSeleccionada.value)
  );

  if (necesitaFecha && !fechaHora.value) {
    errorModal.value = 'Debes asignar fecha y hora para esta etapa.';
    return;
  }

  enviando.value = true;
  try {
    await api.patch(`/postulaciones/${postulacionSeleccionada.value.id}/avanzar`, {
      fechaHora: fechaHora.value || null,
      descripcion: descripcion.value || null,
    });
    cerrarModal();
    await cargar();
  } catch (e: any) {
    errorModal.value = e.response?.data?.error || 'Error al avanzar etapa.';
  } finally {
    enviando.value = false;
  }
};

const marcarResultado = async (p: Postulacion, resultado: 'contratado' | 'finalizado') => {
  const confirmacion = confirm(
    resultado === 'contratado'
      ? `¿Marcar a ${p.postulante?.nombre} como contratado?`
      : `¿Finalizar el proceso de ${p.postulante?.nombre}?`
  );
  if (!confirmacion) return;

  try {
    await api.patch(`/postulaciones/${p.id}/resultado`, { resultado });
    await cargar();
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error al marcar resultado.');
  }
};

// Determina el tipo de la siguiente etapa (necesitamos saber si pide fecha)
// Como el backend no devuelve el array de etapas en /aceptadas, hacemos una
// consulta puntual al detalle del proceso.
const etapasPorProceso = ref<Record<number, any[]>>({});

const cargarEtapas = async () => {
  for (const p of postulaciones.value) {
    if (!etapasPorProceso.value[p.procesoId]) {
      try {
        const { data } = await api.get(`/procesos/${p.procesoId}`);
        etapasPorProceso.value[p.procesoId] = data.etapas || [];
      } catch {
        etapasPorProceso.value[p.procesoId] = [];
      }
    }
  }
};

const proximaEtapaTipo = (p: Postulacion): string => {
  const etapas = etapasPorProceso.value[p.procesoId] || [];
  const ordenActual = p.etapaActual?.orden ?? 0;
  const siguiente = etapas.find((e: any) => e.orden > ordenActual);
  return siguiente?.tipo || 'final';
};

const proximaEtapaNombre = (p: Postulacion): string => {
  const etapas = etapasPorProceso.value[p.procesoId] || [];
  const ordenActual = p.etapaActual?.orden ?? 0;
  const siguiente = etapas.find((e: any) => e.orden > ordenActual);
  return siguiente?.nombre || 'Sin más etapas';
};

const colorEstado = (estado: string): string => {
  const mapa: Record<string, string> = {
    seleccionado: 'bg-blue-100 text-blue-800',
    en_proceso: 'bg-indigo-100 text-indigo-800',
  };
  return mapa[estado] || 'bg-gray-100 text-gray-800';
};

// Recalcular las etapas cuando termina la carga inicial
onMounted(async () => {
  await cargar();
  await cargarEtapas();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <header class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Postulaciones aceptadas</h1>
          <p class="text-gray-600 mt-1">Avanza etapas y asigna fechas de entrevista.</p>
        </div>
        <nav class="flex gap-2">
          <RouterLink to="/encargado/pendientes" class="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">Pendientes</RouterLink>
          <RouterLink to="/encargado/aceptadas" class="px-4 py-2 bg-blue-600 text-white rounded text-sm">Aceptadas</RouterLink>
        </nav>
      </header>

      <div v-if="cargando" class="text-center text-gray-500">Cargando...</div>
      <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>
      <div v-else-if="postulaciones.length === 0" class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No hay postulaciones aceptadas todavía.
      </div>

      <div v-else class="space-y-4">
        <article
          v-for="p in postulaciones"
          :key="p.id"
          class="bg-white rounded-lg shadow p-5"
        >
          <div class="flex items-start justify-between gap-4 mb-3">
            <div>
              <h2 class="text-lg font-semibold text-gray-800">
                {{ p.postulante?.nombre }} {{ p.postulante?.apellido }}
              </h2>
              <p class="text-sm text-gray-500">
                {{ p.proceso.nombre }} · DNI: {{ p.postulante?.dni || '—' }}
              </p>
            </div>
            <span :class="['px-3 py-1 rounded-full text-xs font-semibold', colorEstado(p.estado)]">
              {{ p.estado }}
            </span>
          </div>

          <div class="text-sm text-gray-700 mb-4">
            <p>
              <span class="text-gray-500">Etapa actual: </span>
              <strong>{{ p.etapaActual?.nombre || '—' }}</strong>
            </p>
            <p class="mt-1">
              <span class="text-gray-500">Siguiente etapa: </span>
              <strong>{{ proximaEtapaNombre(p) }}</strong>
              <span v-if="proximaEtapaTipo(p) === 'entrevista' || proximaEtapaTipo(p) === 'tecnica'" class="text-xs text-indigo-600">
                (requiere fecha)
              </span>
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              @click="abrirModal(p)"
              :disabled="proximaEtapaTipo(p) === 'final'"
              class="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Avanzar etapa
            </button>
            <button
              @click="marcarResultado(p, 'contratado')"
              class="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Contratado
            </button>
            <button
              @click="marcarResultado(p, 'finalizado')"
              class="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Finalizar
            </button>
            <RouterLink
              :to="`/encargado/postulacion/${p.id}`"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Ver detalle
            </RouterLink>
          </div>
        </article>
      </div>
    </div>

    <!-- Modal de avance de etapa -->
    <div
      v-if="modalAbierto"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="cerrarModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-1">Avanzar etapa</h2>
        <p class="text-sm text-gray-500 mb-4">
          {{ postulacionSeleccionada?.postulante?.nombre }} {{ postulacionSeleccionada?.postulante?.apellido }}
          · Siguiente: <strong>{{ postulacionSeleccionada ? proximaEtapaNombre(postulacionSeleccionada) : '' }}</strong>
        </p>

        <div v-if="postulacionSeleccionada && ['entrevista', 'tecnica'].includes(proximaEtapaTipo(postulacionSeleccionada))" class="space-y-3">
          <label class="block">
            <span class="text-sm text-gray-600">Fecha y hora *</span>
            <input
              v-model="fechaHora"
              type="datetime-local"
              class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label class="block">
            <span class="text-sm text-gray-600">Descripción (link de videollamada, dirección, etc.)</span>
            <textarea
              v-model="descripcion"
              rows="3"
              class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Entrevista virtual en https://meet.google.com/abc-defg-hij"
            ></textarea>
          </label>
        </div>

        <p v-if="errorModal" class="text-red-600 text-sm mt-2">{{ errorModal }}</p>

        <div class="flex gap-2 mt-6">
          <button
            @click="cerrarModal"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            @click="avanzar"
            :disabled="enviando"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {{ enviando ? 'Avanzando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>