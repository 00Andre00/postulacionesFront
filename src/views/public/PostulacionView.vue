<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../api/client';
import type { Proceso, Etapa } from '../../types';
import Spinner from '../../components/Spinner.vue';

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

onMounted(cargarProceso);
</script>

<template>
  <div class="min-h-screen bg-surface py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Credenciales generadas -->
      <div v-if="resultado" class="bg-surface rounded-card border border-outline-variant p-8 shadow-sm">
        <div class="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-4 text-xl">
          ✓
        </div>
        <h1 class="text-2xl font-bold text-on-surface mb-4">¡Postulación registrada!</h1>
        <p class="text-on-surface-variant mb-6">
          Guarda estas credenciales. Las necesitarás para consultar el estado de tu postulación.
          La cuenta expira el {{ new Date(resultado.credenciales.expiresAt).toLocaleDateString() }}.
        </p>

        <div class="bg-surface-variant rounded-lg p-4 mb-6">
          <p class="mb-2 text-on-surface"><span class="font-semibold">Usuario:</span> {{ resultado.credenciales.username }}</p>
          <p class="text-on-surface"><span class="font-semibold">Contraseña:</span> {{ resultado.credenciales.password }}</p>
        </div>

        <div class="bg-primary-container rounded-lg p-4 mb-6 text-sm">
          <p class="font-semibold text-on-primary-container mb-2">Datos extraídos de tu CV:</p>
          <ul class="text-on-primary-container space-y-1">
            <li><strong>Universidad:</strong> {{ resultado.datosExtraidos.universidad || 'No especificado' }}</li>
            <li><strong>Profesión:</strong> {{ resultado.datosExtraidos.profesion || 'No especificado' }}</li>
            <li><strong>Fecha de título:</strong> {{ resultado.datosExtraidos.fechaTitulo || 'No especificado' }}</li>
          </ul>
          <p class="text-xs mt-2 opacity-80">Un encargado revisará y confirmará estos datos antes de continuar el proceso.</p>
        </div>

        <RouterLink
          to="/login"
          class="block text-center px-4 py-2.5 bg-primary text-on-primary rounded-button hover:opacity-90"
        >
          Ir a iniciar sesión
        </RouterLink>
      </div>

      <!-- Formulario -->
      <div v-else>
        <Spinner v-if="cargandoProceso" />

        <div v-else-if="error && !proceso" class="bg-error-container text-on-error-container p-4 rounded-card">{{ error }}</div>

        <div v-else-if="proceso" class="bg-surface rounded-card border border-outline-variant p-8 shadow-sm">
          <h1 class="text-2xl font-bold text-on-surface mb-1">{{ proceso.nombre }}</h1>
          <p class="text-on-surface-variant mb-6">{{ proceso.descripcion }}</p>

          <div v-if="proceso.etapas?.length" class="mb-6 bg-surface-variant rounded-lg p-4">
            <p class="text-sm font-semibold text-on-surface mb-2">Etapas del proceso:</p>
            <ol class="list-decimal list-inside text-sm text-on-surface-variant space-y-1">
              <li v-for="et in proceso.etapas" :key="et.id">
                {{ et.nombre }} <span class="text-xs opacity-70">({{ et.tipo }})</span>
              </li>
            </ol>
          </div>

          <form @submit.prevent="enviar" class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <label class="block">
                <span class="text-sm text-on-surface-variant">Nombre</span>
                <input v-model="nombre" type="text" required class="mt-1 w-full px-4 py-2.5 bg-surface-variant border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
              </label>
              <label class="block">
                <span class="text-sm text-on-surface-variant">Apellido</span>
                <input v-model="apellido" type="text" required class="mt-1 w-full px-4 py-2.5 bg-surface-variant border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
              </label>
            </div>

            <label class="block">
              <span class="text-sm text-on-surface-variant">DNI</span>
              <input v-model="dni" type="text" required class="mt-1 w-full px-4 py-2.5 bg-surface-variant border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </label>

            <label class="block">
              <span class="text-sm text-on-surface-variant">CV en PDF</span>
              <input @change="onFileChange" type="file" accept="application/pdf" required class="mt-1 w-full text-sm text-on-surface-variant file:mr-3 file:px-4 file:py-2 file:rounded-button file:border-0 file:bg-primary file:text-on-primary file:cursor-pointer hover:file:opacity-90" />
              <span class="text-xs text-on-surface-variant">Máximo 10 MB.</span>
            </label>

            <p v-if="error" class="text-error text-sm">{{ error }}</p>

            <button type="submit" :disabled="enviando" class="w-full py-2.5 bg-primary text-on-primary rounded-button hover:opacity-90 disabled:opacity-50 transition">
              {{ enviando ? 'Procesando CV...' : 'Enviar postulación' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>