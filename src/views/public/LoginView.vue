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
    // Redirige según el rol
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
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <form @submit.prevent="enviar" class="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Iniciar sesión</h2>

      <label class="block mb-4">
        <span class="text-sm text-gray-600">Usuario</span>
        <input v-model="username" type="text" required class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>

      <label class="block mb-4">
        <span class="text-sm text-gray-600">Contraseña</span>
        <input v-model="password" type="password" required class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>

      <p v-if="error" class="text-red-600 text-sm mb-4">{{ error }}</p>

      <button type="submit" :disabled="cargando" class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
        {{ cargando ? 'Entrando...' : 'Entrar' }}
      </button>

      <RouterLink to="/" class="block text-center text-sm text-blue-600 mt-4 hover:underline">
        Volver al inicio
      </RouterLink>
    </form>
  </div>
</template>