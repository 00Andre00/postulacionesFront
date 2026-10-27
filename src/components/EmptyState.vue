<script setup lang="ts">
defineProps<{ titulo: string; mensaje?: string; icono?: string }>();
</script>

<template>
  <div class="bg-white rounded-xl shadow p-10 text-center">
    <div class="text-5xl mb-3">{{ icono || '📭' }}</div>
    <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ titulo }}</h3>
    <p v-if="mensaje" class="text-sm text-gray-500">{{ mensaje }}</p>
  </div>
</template>