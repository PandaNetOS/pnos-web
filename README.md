# pnos-web

pnos 系统级 WebUI。提供系统管理、应用商店、容器管理、文件管理等功能。

## 技术栈

- Vue 3 + Vite + TypeScript
- Naive UI（组件库）
- Pinia（状态管理）
- Vue Router 4
- ECharts（图表）
- Axios（HTTP）

## 开发

```bash
npm install
npm run dev
```

开发服务器默认运行在 http://localhost:5173，API 代理到 http://localhost:8080（pnos-runtime）。

## 构建

```bash
npm run build
```

产物在 `dist/` 目录，由 pnos-runtime 托管。

## 页面

| 路由 | 页面 | 状态 |
|------|------|------|
| /dashboard | 仪表盘（CPU/内存/磁盘监控） | ✅ |
| /store | 应用商店（列表/搜索/安装） | ✅ |
| /containers | 容器管理（列表/启停/删除） | ✅ |
| /files | 文件管理 | 🔶 开发中 |
| /settings | 设置（系统信息/商店源） | ✅ |

## 布局

侧边栏模式（MVP），桌面模式后续迭代。

## 许可证

MIT
