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
        meta: { title: '仪表盘', icon: 'dashboard' },
      },
      {
        path: 'store',
        name: 'Store',
        component: () => import('@/views/store/index.vue'),
        meta: { title: '应用商店', icon: 'store' },
      },
      {
        path: 'containers',
        name: 'Containers',
        component: () => import('@/views/containers/index.vue'),
        meta: { title: '容器管理', icon: 'container' },
      },
      {
        path: 'files',
        name: 'Files',
        component: () => import('@/views/files/index.vue'),
        meta: { title: '文件管理', icon: 'files' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '设置', icon: 'settings' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
