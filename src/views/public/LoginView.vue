<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';

const auth = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');
const cargando = ref(false);

const enviar = async () => {
  error.value = '';
  cargando.value = true;
  try {
    const u = await auth.login(username.value, password.value);
    if (u.rol === 'postulante') router.push('/mi-panel');
    else if (u.rol === 'encargado') router.push('/encargado/pendientes');
    else router.push('/admin/usuarios');
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Error al iniciar sesión';
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-4">
    <form
      @submit.prevent="enviar"
      class="bg-surface rounded-card border border-outline-variant p-8 w-full max-w-sm shadow-sm"
    >
      <h2 class="text-2xl font-bold text-on-surface mb-6 text-center">Iniciar sesión</h2>

      <label class="block mb-4">
        <span class="text-sm text-on-surface-variant">Usuario</span>
        <input
          v-model="username"
          type="text"
          required
          class="mt-1 w-full px-4 py-2.5 bg-surface-variant border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </label>

      <label class="block mb-6">
        <span class="text-sm text-on-surface-variant">Contraseña</span>
        <input
          v-model="password"
          type="password"
          required
          class="mt-1 w-full px-4 py-2.5 bg-surface-variant border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </label>

      <p v-if="error" class="text-error text-sm mb-4">{{ error }}</p>

      <button
        type="submit"
        :disabled="cargando"
        class="w-full py-2.5 bg-primary text-on-primary rounded-button hover:opacity-90 disabled:opacity-50 transition"
      >
        {{ cargando ? 'Entrando...' : 'Entrar' }}
      </button>

      <RouterLink to="/" class="block text-center text-sm text-primary mt-4 hover:underline">
        Volver al inicio
      </RouterLink>
    </form>
  </div>
</template>