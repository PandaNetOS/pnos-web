# pnos-web AGENTS.md

> 本文件是 AI 代理进入 pnos-web 仓库时的首读指南。
> 生态级全局约束请参考 [根目录 AGENTS.md](../AGENTS.md)。

## 仓库定位

pnos-web 是 PandaNetOS 生态的**系统级 Web 前端**，生态统一管理界面。提供 Agent 管理、任务监控、数据看板、配置管理等功能。

## 架构概览

```
pnos-web/
├── src/          # 前端源代码
├── public/       # 静态资源
└── dist/         # 构建产物
```

## 目录结构

```
pnos-web/
├── src/          # 前端源代码（React/Vue）
├── public/       # 静态资源
├── dist/         # 构建产物
└── package.json
```

## 构建与测试

| 命令 | 说明 |
|---|---|
| `npm install` | 安装依赖 |
| `npm run build` | 构建生产版本 |
| `npm run dev` | 开发模式 |

## 依赖关系

- **依赖**：Node.js 生态
- **后端对接**：pnos-runtime（API）、各 Agent（HTTP API）

## 注意事项

1. pnos-web 是纯前端项目，通过 API 与后端交互
2. 开发时需确保 pnos-runtime 和各 Agent 已启动
3. **不允许放假控件，也不放空说明**：后端没有的能力不要渲染成可点的开关/按钮，
   也不要塞"待后端支持"之类的提示条——直接不渲染，需求记在下面「待后端接口」一节
4. **禁止写死后端配置值**：端口 / 反向代理前缀 / CORS 等一律读 `GET /api/v1/system/config`，
   配置接口取不到时显示占位符 `—`，不得回退成硬编码默认值
5. **告警阈值必须真正生效**：`stores/settings.ts` 的三个阈值由 `stores/system.ts` 的
   `metricLevel()` 消费（达到阈值 = 告警，超过阈值 + `ALERT_DANGER_MARGIN` = 严重），
   概览页与应用页的等级展示都取自该判定，新增消费方不得再写死百分比
6. **新增 UI 控件前先确认组件真实存在**：v0.2.1 之前设置页用了 `<n-segmented>`，而 Naive UI
   并没有 Segmented 组件，导致该控件**静默不渲染**（无报错、只有控制台 warn），主题切换因此长期不可用。
   核查方式：在 `node_modules/naive-ui/es/index.mjs` 中搜索 `as N组件名`；
   改完 UI 用真实浏览器核查 DOM 与控制台告警（本仓库曾用 headless Chrome + CDP 验证）
7. **组件内禁止写死界面色**：侧栏/顶栏毛玻璃、分隔线、用量条槽、悬停层、弱化图标等一律用
   `src/styles/tokens.css` 的语义变量（`--pnos-glass*` / `--pnos-divider` / `--pnos-track*` /
   `--pnos-hover*` / `--pnos-icon*` / `--pnos-frame-bg` / `--pnos-brandmark-*`），
   浅色值与深色值都在 tokens 里成对给出。历史教训：侧栏/顶栏写死 `rgba(255,255,255,.9x)`，
   切到深色时整条侧栏与顶栏仍然发白（v0.2.3 修复）
8. **改主题相关代码后必须双眼验收**：用 headless Chrome + CDP 在深色/浅色下各截一张图
   （`Emulation.setDeviceMetricsOverride` + `Page.captureScreenshot`），并确认控制台无告警
9. **系统状态只有一处判定**：侧栏页脚 / 顶栏 / 概览页统一取 `systemStore.systemStatus`
   （`offline` 优先于 `healthy/warning/danger`，见 `statusText`）。后端拉不到数据时**必须**
   显示"后端未连接"，不得沿用旧值或零值报"运行正常"；模拟方式：CDP `Network.setBlockedURLs`
   屏蔽 `/api/v1/system/*` 后看侧栏是否变色
10. **系统指标轮询由侧栏独占**：`SidebarLayout` 是唯一调用 `systemStore.startPolling/stopPolling`
    的地方（它常驻，其他视图会被卸载）。页面视图不要再 start/stop，否则离开该页会把侧栏状态轮询一起停掉；
    页面自己需要首屏数据时只调 `fetchStats()` 一次
11. **路由命名避开 `/app/*`**：应用壳用 `/apps/:id`（原 `/app/:id` 与 pnos-runtime 的应用反代前缀
    `protocol::APP_PROXY_PREFIX` 撞车，硬刷新会被反代吃掉）。新增前端路由前先确认不与 runtime 的
    `/api/*`、`/app/*`、`/health` 冲突
12. **深链可用性依赖 runtime 的 SPA 回落**：history 模式下 `/dashboard`、`/apps/pk` 等地址由
    runtime 回落 `index.html` 才能直接打开/刷新；部署后必须实测这些地址（`curl -I` 看是否 200 + text/html）
13. **不在页面里放假数据**：概览页原有写死的"最近活动"（永远"刚刚"），v0.2.6 已移除；
    要展示活动/事件请接 runtime 的 `/api/v1/ws` 事件流，不要写死占位内容

## 待后端接口（不在 UI 暴露，只在文档记录）

以下能力 pnos-runtime 目前没有对应接口，因此设置页**不渲染任何控件、也不放提示条**；
接口补齐后再按第 3 条要求真正接上：

| 能力 | 现状 | 需要后端提供 |
|---|---|---|
| 商店源增删 / 启停 | `GET /store/sources` 只返回配置里的单个内置源，`refresh_source` 忽略 id，无多源存储 | `POST /store/sources`、`DELETE /store/sources/:id`、`POST /store/sources/:id/enable` + 源列表持久化 |
| 自动更新应用 | 无版本轮询与升级调度（按架构属调度器职责） | 更新检查接口；当前仅有手动 `POST /installed/:id/upgrade` |

## 变更历史

| 日期 | 版本 | 变更内容 |
|---|---|---|
| 2026-09-16 | v1.0 | 初始版本 |
| 2026-09-18 | v0.2.1 | 设置页适配：三个告警阈值接入概览页健康判定（原为死配置）；网络区改读 runtime `/system/config` 真实生效值；移除商店源增删/自动更新等无后端支撑的假控件，改为接口需求说明 |
| 2026-09-18 | v0.2.2 | 修复主题切换不可用（`n-segmented` 在 Naive UI 中不存在 → 改为 `n-radio-group` + `n-radio-button`），并核对全部 17 个 `n-*` 组件真实存在 |
| 2026-09-18 | v0.2.3 | 修复深色主题只做一半：新增 17 个语义色 token（玻璃层/分隔线/用量条槽/悬停层/弱化图标/品牌方块/iframe 底色）并清除侧栏·顶栏·用量条·状态标签等处写死的浅色；深色下截图验收通过 |
| 2026-09-18 | v0.2.4 | 侧栏页脚与顶栏系统状态接上真实数据（原为写死"系统运行正常"）：新增 `online`/`systemStatus`/`statusText`，后端不可达时显示"后端未连接"（灰点）并说明数据可能过期；概览页同样不再谎报正常；系统轮询改由常驻的侧栏独占 |
| 2026-09-18 | v0.2.5 | 按需求移除设置页商店区的"待后端接口"提示条（说明移入本文件「待后端接口」一节，UI 保持干净）；第 3 条约束相应改为"不放空说明" |
| 2026-09-18 | v0.2.6 | 上线包：应用壳路由 `/app/:id` → `/apps/:id`（消除与 runtime 反代前缀撞车，硬刷新不再落到反代）；移除概览页写死的"最近活动"假数据；深链在生产形态（8080 硬导航）实测 200 且渲染正常 |
