import { createRouter, createWebHistory } from 'vue-router'

const TOKEN_KEY = 'conduit_token'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      redirect: '/workflows',
    },
    {
      path: '/workflows',
      name: 'workflows',
      component: () => import('../views/WorkflowsView.vue'),
    },
    {
      path: '/workflow/:id',
      name: 'editor',
      component: () => import('../views/HomeView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY)

  if (!isAuthenticated && !to.meta.public) {
    return { name: 'login' }
  }

  if (isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    return { name: 'workflows' }
  }
})

export default router
