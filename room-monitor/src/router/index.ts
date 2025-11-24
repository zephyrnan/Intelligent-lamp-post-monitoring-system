import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/RoomList.vue'),
    },
    {
      path: '/room/:id',
      name: 'roomDetail',
      component: () => import('../views/RoomDetail.vue'),
      props: true
    },
    {
      path: '/alarms',
      name: 'alarms',
      component: () => import('../views/AlarmList.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryData.vue'),
    },
    {
      path: '/detection-history',
      name: 'detectionHistory',
      component: () => import('../views/DetectionHistory.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('../views/NotFound.vue'),
    },
  ],
})

export default router
