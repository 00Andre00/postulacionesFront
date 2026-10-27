import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.store";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Públicas
    {
      path: "/",
      name: "home",
      component: () => import("../views/public/HomeView.vue"),
    },
    {
      path: "/postular/:procesoId",
      name: "postular",
      component: () => import("../views/public/PostulacionView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/public/LoginView.vue"),
    },

    // Postulante
    {
      path: "/mi-panel",
      name: "mi-panel",
      component: () => import("../views/postulante/PanelView.vue"),
      meta: { rol: "postulante" },
    },

    // Encargado
    {
      path: "/encargado/pendientes",
      name: "pendientes",
      component: () => import("../views/encargado/PendientesView.vue"),
      meta: { rol: "encargado" },
    },
    {
      path: "/encargado/aceptadas",
      name: "aceptadas",
      component: () => import("../views/encargado/AceptadasView.vue"),
      meta: { rol: "encargado" },
    },
    {
      path: "/encargado/postulacion/:id",
      name: "postulacion-detalle",
      component: () => import("../views/encargado/PostulacionDetalleView.vue"),
      meta: { rol: "encargado" },
    },

    // Admin
    {
      path: "/admin/usuarios",
      name: "admin-usuarios",
      component: () => import("../views/admin/UsuariosView.vue"),
      meta: { rol: "admin" },
    },
    {
      path: "/encargado/procesos",
      name: "encargado-procesos",
      component: () => import("../views/encargado/ProcesosView.vue"),
      meta: { rol: "encargado" },
    },
    {
      path: "/encargado/procesos/nuevo",
      name: "encargado-proceso-nuevo",
      component: () => import("../views/encargado/ProcesoFormView.vue"),
      meta: { rol: "encargado" },
    },
    {
      path: "/encargado/procesos/:id",
      name: "encargado-proceso-editar",
      component: () => import("../views/encargado/ProcesoFormView.vue"),
      meta: { rol: "encargado" },
    },
    // 404
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  // Rutas que requieren login + rol específico
  if (to.meta.rol) {
    if (!auth.isAuthenticated) {
      return { name: "login", query: { redirect: to.fullPath } };
    }
    if (auth.rol !== to.meta.rol && auth.rol !== "admin") {
      // Admin puede acceder a todo; otros roles solo a lo suyo
      return { name: "home" };
    }
  }

  return true;
});

export default router;
