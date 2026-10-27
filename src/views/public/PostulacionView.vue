<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../api/client';
import type { Proceso, Etapa } from '../../types';

const route = useRoute();
const procesoId = Number(route.params.procesoId);

const proceso = ref<(Proceso & { etapas: Etapa[] }) | null>(null);
const cargandoProceso = ref(true);

const nombre = ref('');
const apellido = ref('');
const dni = ref('');
const archivo = ref<File | null>(null);

const enviando = ref(false);
const error = ref('');
const resultado = ref<{
  postulacionId: number;
  credenciales: { username: string; password: string; expiresAt: string };
  datosExtraidos: { universidad: string | null; profesion: string | null; fechaTitulo: string | null; extraidoPor: string };
} | null>(null);

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  archivo.value = target.files?.[0] ?? null;
};

const cargarProceso = async () => {
  try {
    const { data } = await api.get(`/procesos/${procesoId}`);
    proceso.value = data;
  } catch {
    error.value = 'Proceso no encontrado.';
  } finally {
    cargandoProceso.value = false;
  }
};

onMounted(cargarProceso);


const enviar = async () => {
  error.value = '';

  if (!nombre.value.trim() || !apellido.value.trim() || !dni.value.trim()) {
    error.value = 'Nombre, apellido y DNI son obligatorios.';
    return;
  }
  if (!archivo.value) {
    error.value = 'Debes adjuntar tu CV en PDF.';
    return;
  }
  if (archivo.value.type !== 'application/pdf') {
    error.value = 'El CV debe ser un archivo PDF.';
    return;
  }

  enviando.value = true;
  try {
    const formData = new FormData();
    formData.append('nombre', nombre.value.trim());
    formData.append('apellido', apellido.value.trim());
    formData.append('dni', dni.value.trim());
    formData.append('procesoId', String(procesoId));
    formData.append('cv', archivo.value);

    const { data } = await api.post('/postulaciones', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    resultado.value = data;
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Error al enviar la postulación.';
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Vista de credenciales generadas -->
      <div v-if="resultado" class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-2xl font-bold text-green-700 mb-4">¡Postulación registrada!</h1>
        <p class="text-gray-700 mb-6">
          Guarda estas credenciales. Las necesitarás para consultar el estado de tu postulación.
          La cuenta expira el {{ new Date(resultado.credenciales.expiresAt).toLocaleDateString() }}.
        </p>

        <div class="bg-gray-100 rounded p-4 mb-6">
          <p class="mb-2"><span class="font-semibold">Usuario:</span> {{ resultado.credenciales.username }}</p>
          <p><span class="font-semibold">Contraseña:</span> {{ resultado.credenciales.password }}</p>
        </div>

        <div class="bg-blue-50 rounded p-4 mb-6 text-sm">
          <p class="font-semibold text-blue-800 mb-2">Datos extraídos de tu CV:</p>
          <ul class="text-blue-900 space-y-1">
            <li><strong>Universidad:</strong> {{ resultado.datosExtraidos.universidad || 'No especificado' }}</li>
            <li><strong>Profesión:</strong> {{ resultado.datosExtraidos.profesion || 'No especificado' }}</li>
            <li><strong>Fecha de título:</strong> {{ resultado.datosExtraidos.fechaTitulo || 'No especificado' }}</li>
          </ul>
          <p class="text-xs text-blue-700 mt-2">Un encargado revisará y confirmará estos datos antes de continuar el proceso.</p>
        </div>

        <RouterLink to="/login" class="block text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Ir a iniciar sesión
        </RouterLink>
      </div>

      <!-- Vista del formulario -->
      <div v-else>
        <div v-if="cargandoProceso" class="text-center text-gray-500">Cargando proceso...</div>

        <div v-else-if="error && !proceso" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>

        <div v-else-if="proceso" class="bg-white rounded-lg shadow-lg p-8">
          <h1 class="text-2xl font-bold text-gray-800 mb-1">{{ proceso.nombre }}</h1>
          <p class="text-gray-600 mb-6">{{ proceso.descripcion }}</p>

          <div v-if="proceso.etapas?.length" class="mb-6 bg-gray-50 rounded p-4">
            <p class="text-sm font-semibold text-gray-700 mb-2">Etapas del proceso:</p>
            <ol class="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li v-for="et in proceso.etapas" :key="et.id">
                {{ et.nombre }} <span class="text-xs text-gray-400">({{ et.tipo }})</span>
              </li>
            </ol>
          </div>

          <form @submit.prevent="enviar" class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <label class="block">
                <span class="text-sm text-gray-600">Nombre</span>
                <input v-model="nombre" type="text" required class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label class="block">
                <span class="text-sm text-gray-600">Apellido</span>
                <input v-model="apellido" type="text" required class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
            </div>

            <label class="block">
              <span class="text-sm text-gray-600">DNI</span>
              <input v-model="dni" type="text" required class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>

            <label class="block">
              <span class="text-sm text-gray-600">CV en PDF</span>
              <input @change="onFileChange" type="file" accept="application/pdf" required class="mt-1 w-full text-sm" />
              <span class="text-xs text-gray-500">Máximo 10 MB.</span>
            </label>

            <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

            <button type="submit" :disabled="enviando" class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {{ enviando ? 'Procesando CV...' : 'Enviar postulación' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>