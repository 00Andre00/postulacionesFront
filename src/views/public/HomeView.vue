<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import type { Proceso } from '../../types';
import Spinner from '../../components/Spinner.vue';
import EmptyState from '../../components/EmptyState.vue';

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
  <div class="min-h-screen bg-surface py-12 px-4">
    <div class="max-w-5xl mx-auto">
      <header class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold text-on-surface mb-3">Procesos de postulación</h1>
        <p class="text-on-surface-variant max-w-lg mx-auto">
          Elige un proceso y envía tu CV. Al finalizar recibirás tus credenciales de acceso.
        </p>
      </header>

      <Spinner v-if="cargando" />

      <div v-else-if="error" class="bg-error-container text-on-error-container p-4 rounded-card">{{ error }}</div>

      <EmptyState
        v-else-if="procesos.length === 0"
        titulo="Sin procesos activos"
        mensaje="No hay procesos de postulación disponibles en este momento."
      />

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="p in procesos"
          :key="p.id"
          class="bg-surface rounded-card border border-outline-variant p-6 flex flex-col hover:shadow-md transition-shadow"
        >
          <h2 class="text-lg font-semibold text-on-surface mb-2">{{ p.nombre }}</h2>
          <p class="text-on-surface-variant text-sm flex-1 line-clamp-3">
            {{ p.descripcion || 'Sin descripción' }}
          </p>
          <RouterLink
            :to="`/postular/${p.id}`"
            class="mt-4 inline-block text-center px-4 py-2 bg-primary text-on-primary rounded-button hover:opacity-90 transition"
          >
            Postular
          </RouterLink>
        </article>
      </div>
    </div>
  </div>
</template>