import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import SidebarLayout from '@/layouts/SidebarLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: SidebarLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
      },
      {
        path: 'store',
        name: 'Store',
        component: () => import('@/views/store/index.vue'),
      },
      {
        path: 'apps',
        name: 'Apps',
        component: () => import('@/views/apps/index.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...routes,
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

export default router
