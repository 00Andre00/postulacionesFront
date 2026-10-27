import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api/client';
import type { LoginResponse, Rol, Usuario } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref<Usuario | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const isAuthenticated = computed(() => !!token.value && !!usuario.value);
  const rol = computed<Rol | null>(() => usuario.value?.rol ?? null);

  // Carga el usuario desde localStorage al iniciar la app
  const cargarDesdeStorage = (): void => {
    const guardado = localStorage.getItem('usuario');
    if (guardado) {
      try {
        usuario.value = JSON.parse(guardado);
      } catch {
        usuario.value = null;
      }
    }
  };

  const login = async (username: string, password: string): Promise<Usuario> => {
    const { data } = await api.post<LoginResponse>('/auth/login', { username, password });
    token.value = data.token;
    usuario.value = data.usuario;
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    return data.usuario;
  };

  const logout = (): void => {
    token.value = null;
    usuario.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return { usuario, token, isAuthenticated, rol, cargarDesdeStorage, login, logout };
});