<script setup lang="ts">
import { useToastStore } from '../stores/toast.store.ts';

const toast = useToastStore();

const colorClase = (tipo: string) => {
  const mapa: Record<string, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
  };
  return mapa[tipo] || 'bg-gray-700';
};
</script>

<template>
  <div class="fixed top-4 right-4 z-100 flex flex-col gap-2 max-w-sm">
    <TransitionGroup
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="t in toast.items"
        :key="t.id"
        :class="['text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-start gap-3', colorClase(t.tipo)]"
      >
        <span class="flex-1">{{ t.mensaje }}</span>
        <button @click="toast.cerrar(t.id)" class="opacity-70 hover:opacity-100">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>