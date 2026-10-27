<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import type { Proceso } from '../../types';

const procesos = ref<Proceso[]>([]);
const cargando = ref(true);
const error = ref('');

const cargar = async () => {
  cargando.value = true;
  error.value = '';
  try {
    const { data } = await api.get<Proceso[]>('/procesos');
    procesos.value = data;
  } catch {
    error.value = 'No se pudieron cargar los procesos. Intenta más tarde.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-12">
      <header class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-800 mb-3">Procesos de postulación</h1>
        <p class="text-gray-600">Elige un proceso y envía tu CV. Al finalizar recibirás tus credenciales de acceso.</p>
      </header>

      <div v-if="cargando" class="text-center text-gray-500">Cargando procesos...</div>

      <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>

      <div v-else-if="procesos.length === 0" class="text-center text-gray-500">
        No hay procesos activos en este momento.
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2">
        <article
          v-for="p in procesos"
          :key="p.id"
          class="bg-white rounded-lg shadow p-6 flex flex-col"
        >
          <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ p.nombre }}</h2>
          <p class="text-gray-600 text-sm flex-1">{{ p.descripcion || 'Sin descripción' }}</p>
          <RouterLink
            :to="`/postular/${p.id}`"
            class="mt-4 inline-block text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Postular
          </RouterLink>
        </article>
      </div>
    </div>
  </div>
</template>