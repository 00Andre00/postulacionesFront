<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../../api/client';
import type { Postulacion } from '../../types';

const postulaciones = ref<Postulacion[]>([]);
const cargando = ref(true);
const error = ref('');

const cargar = async () => {
  cargando.value = true;
  error.value = '';
  try {
    const { data } = await api.get<Postulacion[]>('/postulaciones/pendientes');
    postulaciones.value = data;
  } catch {
    error.value = 'No se pudieron cargar las postulaciones pendientes.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <header class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Postulaciones pendientes</h1>
          <p class="text-gray-600 mt-1">Revisa el CV y confirma o rechaza cada postulación.</p>
        </div>
        <nav class="flex gap-2">
          <RouterLink to="/encargado/pendientes" class="px-4 py-2 bg-blue-600 text-white rounded text-sm">Pendientes</RouterLink>
          <RouterLink to="/encargado/aceptadas" class="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">Aceptadas</RouterLink>
        </nav>
      </header>

      <div v-if="cargando" class="text-center text-gray-500">Cargando...</div>
      <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>
      <div v-else-if="postulaciones.length === 0" class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No hay postulaciones pendientes de revisión.
      </div>

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 text-left text-gray-600">
            <tr>
              <th class="px-4 py-3">Postulante</th>
              <th class="px-4 py-3">DNI</th>
              <th class="px-4 py-3">Proceso</th>
              <th class="px-4 py-3">Universidad</th>
              <th class="px-4 py-3">Profesión</th>
              <th class="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in postulaciones" :key="p.id" class="border-t hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-800">
                {{ p.postulante?.nombre }} {{ p.postulante?.apellido }}
              </td>
              <td class="px-4 py-3 text-gray-600">{{ p.postulante?.dni || '—' }}</td>
              <td class="px-4 py-3 text-gray-600">{{ p.proceso.nombre }}</td>
              <td class="px-4 py-3 text-gray-600">{{ p.datosCV?.universidad || '—' }}</td>
              <td class="px-4 py-3 text-gray-600">{{ p.datosCV?.profesion || '—' }}</td>
              <td class="px-4 py-3 text-right">
                <RouterLink
                  :to="`/encargado/postulacion/${p.id}`"
                  class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Revisar
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>