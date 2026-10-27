<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from './stores/auth.store';
import { useRouter, useRoute } from 'vue-router';
import ToastContainer from './components/ToastContainer.vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const menuAbierto = ref(false);

const salir = () => {
  auth.logout();
  router.push('/');
  menuAbierto.value = false;
};

const linkClase = (path: string) => {
  const activo = route.path.startsWith(path);
  return activo
    ? 'text-sm font-medium text-primary border-b-2 border-primary pb-1'
    : 'text-sm font-medium text-on-surface-variant hover:text-primary pb-1';
};

const iniciales = computed(() => {
  if (!auth.usuario) return '';
  return `${auth.usuario.nombre[0] ?? ''}${auth.usuario.apellido[0] ?? ''}`.toUpperCase();
});

const cerrarMenu = () => { menuAbierto.value = false; };
</script>

<template>
  <div class="min-h-screen bg-surface">
    <nav class="bg-surface shadow-sm sticky top-0 z-40 border-b border-outline-variant">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="font-bold text-primary text-lg" @click="cerrarMenu">
            Portal de postulaciones
          </RouterLink>

          <div class="hidden md:flex items-center gap-5">
            <template v-if="auth.isAuthenticated">
              <RouterLink v-if="auth.rol === 'postulante'" to="/mi-panel" :class="linkClase('/mi-panel')">Mi panel</RouterLink>
              <template v-if="auth.rol === 'encargado' || auth.rol === 'admin'">
                <RouterLink to="/encargado/pendientes" :class="linkClase('/encargado/pendientes')">Pendientes</RouterLink>
                <RouterLink to="/encargado/aceptadas" :class="linkClase('/encargado/aceptadas')">Aceptadas</RouterLink>
              </template>
              <RouterLink v-if="auth.rol === 'admin'" to="/admin/usuarios" :class="linkClase('/admin/usuarios')">Usuarios</RouterLink>
            </template>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <template v-if="auth.isAuthenticated">
            <div class="hidden md:flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
                {{ iniciales }}
              </div>
              <span class="text-sm text-on-surface hidden lg:block">{{ auth.usuario?.nombre }}</span>
            </div>
            <button @click="salir" class="hidden md:block text-sm text-error hover:underline">Salir</button>
          </template>
          <RouterLink v-else to="/login" class="hidden md:block text-sm px-4 py-1.5 bg-primary text-on-primary rounded-button hover:opacity-90">
            Entrar
          </RouterLink>

          <button @click="menuAbierto = !menuAbierto" class="md:hidden p-2 text-on-surface">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>

      <div v-if="menuAbierto" class="md:hidden border-t border-outline-variant bg-surface px-4 py-3 space-y-3">
        <template v-if="auth.isAuthenticated">
          <RouterLink v-if="auth.rol === 'postulante'" to="/mi-panel" class="block text-sm text-on-surface" @click="cerrarMenu">Mi panel</RouterLink>
          <template v-if="auth.rol === 'encargado' || auth.rol === 'admin'">
            <RouterLink to="/encargado/pendientes" class="block text-sm text-on-surface" @click="cerrarMenu">Pendientes</RouterLink>
            <RouterLink to="/encargado/aceptadas" class="block text-sm text-on-surface" @click="cerrarMenu">Aceptadas</RouterLink>
          </template>
          <RouterLink v-if="auth.rol === 'admin'" to="/admin/usuarios" class="block text-sm text-on-surface" @click="cerrarMenu">Usuarios</RouterLink>
          <button @click="salir" class="block text-sm text-error w-full text-left">Salir</button>
        </template>
        <RouterLink v-else to="/login" class="block text-sm text-primary font-medium" @click="cerrarMenu">Entrar</RouterLink>
      </div>
    </nav>

    <RouterView />
    <ToastContainer />
  </div>
</template>