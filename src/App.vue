<script setup lang="ts">
import { useAuthStore } from './stores/auth.store';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';
import ToastContainer from './components/ToastContainer.vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const salir = () => {
  auth.logout();
  router.push('/');
};

const linkClase = (path: string) => {
  const activo = route.path.startsWith(path);
  return activo
    ? 'text-sm font-semibold text-blue-700'
    : 'text-sm text-gray-600 hover:text-blue-600';
};

const iniciales = computed(() => {
  if (!auth.usuario) return '';
  return `${auth.usuario.nombre[0] ?? ''}${auth.usuario.apellido[0] ?? ''}`.toUpperCase();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-5">
          <RouterLink to="/" class="font-bold text-blue-600 text-lg tracking-tight">
            Reclutamiento
          </RouterLink>

          <template v-if="auth.isAuthenticated">
            <template v-if="auth.rol === 'postulante'">
              <RouterLink to="/mi-panel" :class="linkClase('/mi-panel')">Mi panel</RouterLink>
            </template>

            <template v-if="auth.rol === 'encargado' || auth.rol === 'admin'">
              <RouterLink to="/encargado/pendientes" :class="linkClase('/encargado/pendientes')">Pendientes</RouterLink>
              <RouterLink to="/encargado/aceptadas" :class="linkClase('/encargado/aceptadas')">Aceptadas</RouterLink>
            </template>

            <template v-if="auth.rol === 'admin'">
              <RouterLink to="/admin/usuarios" :class="linkClase('/admin/usuarios')">Usuarios</RouterLink>
            </template>
          </template>
        </div>

        <div class="flex items-center gap-3">
          <template v-if="auth.isAuthenticated">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {{ iniciales }}
              </div>
              <div class="hidden sm:block text-right leading-tight">
                <div class="text-sm text-gray-800 font-medium">{{ auth.usuario?.nombre }}</div>
                <div class="text-xs text-gray-500">{{ auth.rol }}</div>
              </div>
            </div>
            <button @click="salir" class="text-sm text-red-600 hover:underline">Salir</button>
          </template>
          <RouterLink v-else to="/login" class="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
            Entrar
          </RouterLink>
        </div>
      </div>
    </nav>

    <RouterView />
    <ToastContainer />
  </div>
</template>