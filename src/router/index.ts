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
        // 注意：不能用 /app/:id —— 该前缀是 pnos-runtime 的应用反代入口
        // （pnos-spec protocol::APP_PROXY_PREFIX），硬刷新会被反代吃掉而不是加载本 SPA
        path: 'apps/:id',
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
