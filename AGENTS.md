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

## 变更历史

| 日期 | 版本 | 变更内容 |
|---|---|---|
| 2026-09-16 | v1.0 | 初始版本 |
