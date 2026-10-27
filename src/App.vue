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
  const activo = route.path === path || route.path.startsWith(path + '/');
  return activo
    ? 'px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-container text-on-primary-container'
    : 'px-3 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition';
};

const iniciales = computed(() => {
  if (!auth.usuario) return '';
  return `${auth.usuario.nombre[0] ?? ''}${auth.usuario.apellido[0] ?? ''}`.toUpperCase();
});

const cerrarMenu = () => { menuAbierto.value = false; };
</script>

<template>
  <div class="min-h-screen bg-surface">
    <nav class="bg-surface border-b border-outline-variant sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <RouterLink to="/" class="font-bold text-primary text-lg tracking-tight" @click="cerrarMenu">
            Reclutamiento
          </RouterLink>

          <div class="hidden md:flex items-center gap-1">
            <template v-if="auth.isAuthenticated">
              <RouterLink v-if="auth.rol === 'postulante'" to="/mi-panel" :class="linkClase('/mi-panel')">Mi panel</RouterLink>
              <template v-if="auth.rol === 'encargado' || auth.rol === 'admin'">
                <RouterLink to="/encargado/procesos" :class="linkClase('/encargado/procesos')">Procesos</RouterLink>
                <RouterLink to="/encargado/pendientes" :class="linkClase('/encargado/pendientes')">Pendientes</RouterLink>
                <RouterLink to="/encargado/aceptadas" :class="linkClase('/encargado/aceptadas')">Aceptadas</RouterLink>
                <RouterLink to="/encargado/historico" :class="linkClase('/encargado/historico')">Histórico</RouterLink>
              </template>
              <RouterLink v-if="auth.rol === 'admin'" to="/admin/usuarios" :class="linkClase('/admin/usuarios')">Usuarios</RouterLink>
            </template>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <template v-if="auth.isAuthenticated">
            <div class="hidden md:flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-variant transition">
              <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
                {{ iniciales }}
              </div>
              <div class="hidden lg:block leading-tight">
                <div class="text-sm text-on-surface font-medium">{{ auth.usuario?.nombre }}</div>
                <div class="text-xs text-on-surface-variant capitalize">{{ auth.rol }}</div>
              </div>
            </div>
            <button @click="salir" class="hidden md:block text-sm px-3 py-1.5 rounded-lg text-error hover:bg-error-container transition">
              Salir
            </button>
          </template>
          <RouterLink
            v-else
            to="/login"
            class="hidden md:block text-sm px-4 py-2 bg-primary text-on-primary rounded-lg hover:shadow-md transition font-medium"
          >
            Entrar
          </RouterLink>

          <button @click="menuAbierto = !menuAbierto" class="md:hidden p-2 rounded-lg text-on-surface hover:bg-surface-variant">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="menuAbierto" class="md:hidden border-t border-outline-variant bg-surface px-4 py-3 space-y-1">
        <template v-if="auth.isAuthenticated">
          <RouterLink v-if="auth.rol === 'postulante'" to="/mi-panel" class="block px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-variant" @click="cerrarMenu">Mi panel</RouterLink>
          <template v-if="auth.rol === 'encargado' || auth.rol === 'admin'">
            <RouterLink to="/encargado/procesos" class="block px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-variant" @click="cerrarMenu">Procesos</RouterLink>
            <RouterLink to="/encargado/pendientes" class="block px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-variant" @click="cerrarMenu">Pendientes</RouterLink>
            <RouterLink to="/encargado/aceptadas" class="block px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-variant" @click="cerrarMenu">Aceptadas</RouterLink>
            <RouterLink to="/encargado/historico" class="block px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-variant" @click="cerrarMenu">Histórico</RouterLink>
          </template>
          <RouterLink v-if="auth.rol === 'admin'" to="/admin/usuarios" class="block px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-variant" @click="cerrarMenu">Usuarios</RouterLink>
          <button @click="salir" class="block w-full text-left px-3 py-2 rounded-lg text-sm text-error hover:bg-error-container">Salir</button>
        </template>
        <RouterLink v-else to="/login" class="block px-3 py-2 rounded-lg text-sm text-primary font-medium hover:bg-surface-variant" @click="cerrarMenu">Entrar</RouterLink>
      </div>
    </nav>

    <RouterView />
    <ToastContainer />
  </div>
</template> 