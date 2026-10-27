import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth.store';
import { useToastStore } from './stores/toast.store';
import { setupInterceptors } from './api/client';
import './style.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);

const auth = useAuthStore();
auth.cargarDesdeStorage();

const toast = useToastStore();
setupInterceptors(() => toast.warning('Tu sesión expiró. Inicia sesión de nuevo.'));

app.mount('#app');