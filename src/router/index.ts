import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
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
        path: 'apps',
        name: 'Apps',
        component: () => import('@/views/apps/index.vue'),
      },
      {
        path: 'app/:id',
        name: 'AppShell',
        component: () => import('@/views/app-shell/index.vue'),
      },
      {
        path: 'store',
        redirect: '/apps',
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
