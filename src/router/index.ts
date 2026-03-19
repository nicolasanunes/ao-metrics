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
    {
      path: '/island-farm',
      name: 'island-farm',
      component: () => import('../views/IslandFarmView.vue'),
    },
    {
      path: '/island-herb-garden',
      name: 'island-herb-garden',
      component: () => import('../views/IslandHerbGardenView.vue'),
    },
    {
      path: '/island-pasture',
      name: 'island-pasture',
      component: () => import('../views/IslandPastureView.vue'),
    },
  ],
})

export default router
