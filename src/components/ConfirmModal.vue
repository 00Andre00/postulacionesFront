<script setup lang="ts">
defineProps<{
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  peligro?: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirmar'): void;
  (e: 'cancelar'): void;
}>();
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-150"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="abierto"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[90]"
      @click.self="emit('cancelar')"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ titulo }}</h3>
        <p class="text-gray-600 text-sm mb-6">{{ mensaje }}</p>
        <div class="flex gap-2">
          <button
            @click="emit('cancelar')"
            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {{ textoCancelar || 'Cancelar' }}
          </button>
          <button
            @click="emit('confirmar')"
            :class="[
              'flex-1 px-4 py-2 text-white rounded-lg',
              peligro ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700',
            ]"
          >
            {{ textoConfirmar || 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>