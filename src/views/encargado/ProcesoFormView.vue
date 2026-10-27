<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api/client';
import Spinner from '../../components/Spinner.vue';
import { useToastStore } from '../../stores/toast.store';

interface EtapaForm {
  nombre: string;
  tipo: 'cv' | 'entrevista' | 'tecnica' | 'otro';
  descripcion: string;
}

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const procesoId = route.params.id ? Number(route.params.id) : null;
const esEdicion = computed(() => procesoId !== null);

const nombre = ref('');
const descripcion = ref('');
const etapas = ref<EtapaForm[]>([{ nombre: 'Revisión de CV', tipo: 'cv', descripcion: '' }]);

const cargando = ref(false);
const guardando = ref(false);
const error = ref('');

const cargarProceso = async () => {
  if (!procesoId) return;
  cargando.value = true;
  try {
    const { data } = await api.get(`/procesos/${procesoId}`);
    nombre.value = data.nombre;
    descripcion.value = data.descripcion || '';
    etapas.value = (data.etapas || []).map((e: any) => ({
      nombre: e.nombre,
      tipo: e.tipo,
      descripcion: e.descripcion || '',
    }));
  } catch {
    error.value = 'No se pudo cargar el proceso.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarProceso);

// Añadir etapa (solo si ya hay una cv)
const agregarEtapa = () => {
  etapas.value.push({ nombre: '', tipo: 'entrevista', descripcion: '' });
};

const quitarEtapa = (index: number) => {
  if (etapas.value[index].tipo === 'cv') {
    toast.warning('No puedes quitar la etapa de CV. Es obligatoria.');
    return;
  }
  etapas.value.splice(index, 1);
};

const validar = (): string | null => {
  if (!nombre.value.trim()) return 'El nombre del proceso es obligatorio.';
  if (etapas.value.length === 0) return 'Debe haber al menos una etapa.';
  if (etapas.value[0].tipo !== 'cv') return 'La primera etapa debe ser de tipo CV.';
  const cvCount = etapas.value.filter((e) => e.tipo === 'cv').length;
  if (cvCount !== 1) return 'Debe haber exactamente una etapa de tipo CV.';
  for (const [i, e] of etapas.value.entries()) {
    if (!e.nombre.trim()) return `La etapa ${i + 1} debe tener un nombre.`;
  }
  return null;
};

const guardar = async () => {
  error.value = '';
  const validacion = validar();
  if (validacion) {
    error.value = validacion;
    return;
  }

  guardando.value = true;
  try {
    if (esEdicion.value) {
      // Edición: solo actualiza nombre/descripcion (las etapas no se modifican en el backend)
      await api.patch(`/procesos/${procesoId}`, {
        nombre: nombre.value.trim(),
        descripcion: descripcion.value.trim() || null,
      });
      toast.success('Proceso actualizado');
    } else {
      // Creación: envía etapas
      await api.post('/procesos', {
        nombre: nombre.value.trim(),
        descripcion: descripcion.value.trim() || null,
        etapas: etapas.value.map((e) => ({
          nombre: e.nombre.trim(),
          tipo: e.tipo,
          descripcion: e.descripcion.trim() || null,
        })),
      });
      toast.success('Proceso creado');
    }
    router.push('/encargado/procesos');
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Error al guardar.';
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-surface py-8 px-4">
    <div class="max-w-3xl mx-auto">
      <header class="mb-6">
        <RouterLink to="/encargado/procesos" class="text-sm text-primary hover:underline">
          ← Volver a procesos
        </RouterLink>
        <h1 class="text-2xl font-bold text-on-surface mt-2">
          {{ esEdicion ? 'Editar proceso' : 'Nuevo proceso' }}
        </h1>
      </header>

      <Spinner v-if="cargando" />

      <form v-else @submit.prevent="guardar" class="space-y-6">
        <section class="bg-surface rounded-card border border-outline-variant p-6">
          <h2 class="text-lg font-semibold text-on-surface mb-4">Información general</h2>
          <div class="space-y-4">
            <label class="block">
              <span class="text-sm text-on-surface-variant">Nombre del proceso *</span>
              <input v-model="nombre" type="text" required class="mt-1 w-full px-4 py-2.5 bg-surface-variant border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
            </label>
            <label class="block">
              <span class="text-sm text-on-surface-variant">Descripción</span>
              <textarea v-model="descripcion" rows="3" class="mt-1 w-full px-4 py-2.5 bg-surface-variant border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Describe el puesto y requisitos..."></textarea>
            </label>
          </div>
        </section>

        <section class="bg-surface rounded-card border border-outline-variant p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-on-surface">Etapas del proceso</h2>
            <button
              type="button"
              @click="agregarEtapa"
              class="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-button text-sm hover:opacity-90"
            >
              + Añadir etapa
            </button>
          </div>

          <p class="text-xs text-on-surface-variant mb-4">
            La primera etapa siempre debe ser de tipo <strong>CV</strong> y es obligatoria. Las demás son opcionales.
          </p>

          <div class="space-y-3">
            <div
              v-for="(etapa, i) in etapas"
              :key="i"
              class="bg-surface-variant rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-on-surface">
                  Etapa {{ i + 1 }}
                  <span v-if="etapa.tipo === 'cv'" class="text-xs font-normal text-primary">(obligatoria)</span>
                </span>
                <button
                  v-if="etapa.tipo !== 'cv'"
                  type="button"
                  @click="quitarEtapa(i)"
                  class="text-xs text-error hover:underline"
                >
                  Quitar
                </button>
              </div>

              <div class="grid gap-3 md:grid-cols-2">
                <label class="block">
                  <span class="text-xs text-on-surface-variant">Nombre</span>
                  <input v-model="etapa.nombre" type="text" required class="mt-1 w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </label>
                <label class="block">
                  <span class="text-xs text-on-surface-variant">Tipo</span>
                  <select
                    v-model="etapa.tipo"
                    :disabled="etapa.tipo === 'cv'"
                    class="mt-1 w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  >
                    <option value="cv">CV</option>
                    <option value="entrevista">Entrevista</option>
                    <option value="tecnica">Prueba técnica</option>
                    <option value="otro">Otro</option>
                  </select>
                </label>
              </div>

              <label class="block mt-3">
                <span class="text-xs text-on-surface-variant">Descripción (opcional)</span>
                <input v-model="etapa.descripcion" type="text" class="mt-1 w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ej: Entrevista virtual por Google Meet" />
              </label>
            </div>
          </div>
        </section>

        <p v-if="error" class="text-error text-sm">{{ error }}</p>

        <div class="flex gap-3">
          <RouterLink
            to="/encargado/procesos"
            class="flex-1 text-center px-4 py-2.5 bg-surface-variant text-on-surface-variant rounded-button hover:opacity-90"
          >
            Cancelar
          </RouterLink>
          <button
            type="submit"
            :disabled="guardando"
            class="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-button hover:opacity-90 disabled:opacity-50"
          >
            {{ guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear proceso') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>