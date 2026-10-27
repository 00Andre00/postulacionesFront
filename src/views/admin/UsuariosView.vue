<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api/client';
import type { Usuario, Rol } from '../../types';

const usuarios = ref<Usuario[]>([]);
const cargando = ref(true);
const error = ref('');

// Modal de creación
const modalAbierto = ref(false);
const nombre = ref('');
const apellido = ref('');
const username = ref('');
const password = ref('');
const rol = ref<Rol>('encargado');
const enviando = ref(false);
const errorModal = ref('');

const cargar = async () => {
  cargando.value = true;
  error.value = '';
  try {
    const { data } = await api.get<Usuario[]>('/admin/usuarios');
    usuarios.value = data;
  } catch {
    error.value = 'No se pudieron cargar los usuarios.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);

const abrirModal = () => {
  nombre.value = '';
  apellido.value = '';
  username.value = '';
  password.value = '';
  rol.value = 'encargado';
  errorModal.value = '';
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
};

const crear = async () => {
  errorModal.value = '';
  if (!nombre.value.trim() || !apellido.value.trim() || !username.value.trim() || !password.value) {
    errorModal.value = 'Todos los campos son obligatorios.';
    return;
  }
  enviando.value = true;
  try {
    await api.post('/admin/usuarios', {
      nombre: nombre.value.trim(),
      apellido: apellido.value.trim(),
      username: username.value.trim(),
      password: password.value,
      rol: rol.value,
    });
    cerrarModal();
    await cargar();
  } catch (e: any) {
    errorModal.value = e.response?.data?.error || 'Error al crear usuario.';
  } finally {
    enviando.value = false;
  }
};

const cambiarActivo = async (u: Usuario, activo: boolean) => {
  const accion = activo ? 'activar' : 'desactivar';
  if (!confirm(`¿Seguro que quieres ${accion} a ${u.nombre} ${u.apellido}?`)) return;
  try {
    await api.patch(`/admin/usuarios/${u.id}/activo`, { activo });
    await cargar();
  } catch (e: any) {
    alert(e.response?.data?.error || 'Error al cambiar estado.');
  }
};

const colorRol = (rol: string): string => {
  const mapa: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    encargado: 'bg-blue-100 text-blue-800',
    postulante: 'bg-gray-100 text-gray-800',
  };
  return mapa[rol] || 'bg-gray-100 text-gray-800';
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <header class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Gestión de usuarios</h1>
          <p class="text-gray-600 mt-1">Administra encargados, admins y cuentas de postulantes.</p>
        </div>
        <button
          @click="abrirModal"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Nuevo usuario
        </button>
      </header>

      <div v-if="cargando" class="text-center text-gray-500">Cargando...</div>
      <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 text-left text-gray-600">
            <tr>
              <th class="px-4 py-3">Nombre</th>
              <th class="px-4 py-3">Usuario</th>
              <th class="px-4 py-3">Rol</th>
              <th class="px-4 py-3">Estado</th>
              <th class="px-4 py-3">Expira</th>
              <th class="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.id" class="border-t hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-800">{{ u.nombre }} {{ u.apellido }}</td>
              <td class="px-4 py-3 text-gray-600">{{ u.username }}</td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 rounded text-xs font-semibold', colorRol(u.rol)]">
                  {{ u.rol }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span v-if="u.activo" class="text-green-600 font-medium">Activo</span>
                <span v-else class="text-red-600 font-medium">Inactivo</span>
              </td>
              <td class="px-4 py-3 text-gray-600 text-xs">
                {{ u.expiresAt ? new Date(u.expiresAt).toLocaleDateString() : '—' }}
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  v-if="u.activo"
                  @click="cambiarActivo(u, false)"
                  class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                >
                  Desactivar
                </button>
                <button
                  v-else
                  @click="cambiarActivo(u, true)"
                  class="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                >
                  Activar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de creación -->
    <div
      v-if="modalAbierto"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="cerrarModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Crear usuario</h2>

        <div class="space-y-3">
          <label class="block">
            <span class="text-sm text-gray-600">Nombre</span>
            <input v-model="nombre" type="text" class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label class="block">
            <span class="text-sm text-gray-600">Apellido</span>
            <input v-model="apellido" type="text" class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label class="block">
            <span class="text-sm text-gray-600">Usuario</span>
            <input v-model="username" type="text" class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label class="block">
            <span class="text-sm text-gray-600">Contraseña</span>
            <input v-model="password" type="password" class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label class="block">
            <span class="text-sm text-gray-600">Rol</span>
            <select v-model="rol" class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="encargado">Encargado</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <p v-if="errorModal" class="text-red-600 text-sm">{{ errorModal }}</p>
        </div>

        <div class="flex gap-2 mt-6">
          <button @click="cerrarModal" class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancelar</button>
          <button @click="crear" :disabled="enviando" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {{ enviando ? 'Creando...' : 'Crear' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>