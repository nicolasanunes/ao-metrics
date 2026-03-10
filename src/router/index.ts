import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/market',
      name: 'market',
      component: () => import('../views/MarketView.vue'),
    },
    {
      path: '/refine',
      name: 'refine',
      component: () => import('../views/RefineView.vue'),
    },
  ],
})

export default router
