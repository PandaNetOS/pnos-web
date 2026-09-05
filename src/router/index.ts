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
        meta: { title: '系统概览', icon: 'dashboard', group: 'system' },
      },
      {
        path: 'store',
        name: 'Store',
        component: () => import('@/views/store/index.vue'),
        meta: { title: '应用商店', icon: 'store', group: 'apps' },
      },
      {
        path: 'apps',
        name: 'Apps',
        component: () => import('@/views/apps/index.vue'),
        meta: { title: '已安装应用', icon: 'apps', group: 'apps' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'settings', group: 'settings' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
