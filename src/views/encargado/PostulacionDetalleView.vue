<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api/client';
import type { Postulacion } from '../../types';

const route = useRoute();
const router = useRouter();
const postulacionId = Number(route.params.id);

const postulacion = ref<Postulacion | null>(null);
const cargando = ref(true);
const error = ref('');

// Campos editables
const universidad = ref('');
const profesion = ref('');
const fechaTitulo = ref('');

const enviando = ref(false);

// URL del PDF (con token en query para que el <embed> lo cargue)
const pdfUrl = ref('');

const cargar = async () => {
  cargando.value = true;
  try {
    const { data } = await api.get<Postulacion>(`/postulaciones/${postulacionId}`);
    postulacion.value = data;

    // Precargar campos editables con lo que haya
    universidad.value = data.datosCV?.universidad || '';
    profesion.value = data.datosCV?.profesion || '';
    fechaTitulo.value = data.datosCV?.fechaTitulo
      ? new Date(data.datosCV.fechaTitulo).toISOString().slice(0, 10)
      : '';

    // Para el PDF: usamos fetch con token y creamos un blob URL
    // (el <embed> no envía headers Authorization)
    const token = localStorage.getItem('token');
    const res = await api.get(`/postulaciones/${postulacionId}/cv`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    pdfUrl.value = URL.createObjectURL(res.data);
  } catch {
    error.value = 'No se pudo cargar la postulación.';
  } finally {
    cargando.value = false;
  }
};

const confirmar = async () => {
  error.value = '';
  enviando.value = true;
  try {
    await api.patch(`/postulaciones/${postulacionId}/confirmar`, {
      universidad: universidad.value || null,
      profesion: profesion.value || null,
      fechaTitulo: fechaTitulo.value || null,
    });
    router.push('/encargado/aceptadas');
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Error al confirmar.';
  } finally {
    enviando.value = false;
  }
};

const rechazar = async () => {
  if (!confirm('¿Seguro que quieres rechazar esta postulación?')) return;
  error.value = '';
  enviando.value = true;
  try {
    await api.patch(`/postulaciones/${postulacionId}/rechazar`);
    router.push('/encargado/pendientes');
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Error al rechazar.';
  } finally {
    enviando.value = false;
  }
};

onMounted(cargar);
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div v-if="cargando" class="text-center text-gray-500">Cargando...</div>
      <div v-else-if="error && !postulacion" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>

      <div v-else-if="postulacion">
        <header class="mb-6">
          <RouterLink to="/encargado/pendientes" class="text-sm text-blue-600 hover:underline">
            ← Volver a pendientes
          </RouterLink>
          <h1 class="text-3xl font-bold text-gray-800 mt-2">
            {{ postulacion.postulante?.nombre }} {{ postulacion.postulante?.apellido }}
          </h1>
          <p class="text-gray-600">
            Proceso: <strong>{{ postulacion.proceso.nombre }}</strong>
            · DNI: {{ postulacion.postulante?.dni || '—' }}
            · Usuario: {{ postulacion.postulante?.username }}
          </p>
        </header>

        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Columna izquierda: PDF -->
          <section class="bg-white rounded-lg shadow p-4">
            <h2 class="font-semibold text-gray-700 mb-2">CV original (PDF)</h2>
            <embed
              v-if="pdfUrl"
              :src="pdfUrl"
              type="application/pdf"
              class="w-full rounded border"
              style="height: 700px"
            />
            <p v-else class="text-gray-500 text-sm">No se pudo cargar el PDF.</p>
          </section>

          <!-- Columna derecha: datos editables -->
          <section class="bg-white rounded-lg shadow p-6">
            <h2 class="font-semibold text-gray-700 mb-4">Datos extraídos por OCR</h2>
            <p class="text-xs text-gray-500 mb-4">
              Método: <strong>{{ postulacion.datosCV?.extraidoPor || 'desconocido' }}</strong>.
              Corrige lo que sea necesario antes de confirmar.
            </p>

            <div class="space-y-4">
              <label class="block">
                <span class="text-sm text-gray-600">Universidad</span>
                <input v-model="universidad" type="text" class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>

              <label class="block">
                <span class="text-sm text-gray-600">Profesión</span>
                <input v-model="profesion" type="text" class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>

              <label class="block">
                <span class="text-sm text-gray-600">Fecha de título</span>
                <input v-model="fechaTitulo" type="date" class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>

              <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

              <div class="flex gap-2 pt-2">
                <button
                  @click="confirmar"
                  :disabled="enviando"
                  class="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {{ enviando ? 'Guardando...' : 'Confirmar y aceptar' }}
                </button>
                <button
                  @click="rechazar"
                  :disabled="enviando"
                  class="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>