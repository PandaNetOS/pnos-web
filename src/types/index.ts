// ===== 统一响应 =====

export interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
  request_id?: string
}

// ===== 组件类型 =====

export type ComponentType = 'app' | 'agent' | 'runtime' | 'pk'

export type ComponentStatus =
  | 'running'
  | 'busy'
  | 'offline'
  | 'error'
  | 'not_installed'
  | 'installing'
  | 'stopped'

export type HealthStatus = 'ok' | 'degraded' | 'down'

// ===== 组件信息（对齐 pnos-spec registry.rs ComponentInfo） =====

export interface ComponentInfo {
  id: string
  name: string
  version: string
  component_type: ComponentType
  address: string
  port: number
  serve_host?: string
  serve_port?: number
  capabilities: string[]
  region?: string
  hostname?: string
  platform?: string
  arch?: string
  labels: string[]
  max_concurrent?: number
  max_bandwidth_bps?: number
  status: ComponentStatus
  load: number
  active_tasks: number
  bytes_downloaded: number
  health: HealthStatus
  last_heartbeat: string
  registered_at: string
  base_url: string
  serve_url?: string
  web_path?: string
}

// ===== 系统信息（对齐 pnos-spec system.rs） =====

export interface SystemInfo {
  hostname: string
  os: string
  os_version: string
  kernel: string
  arch: string
  cpu_model: string
  cpu_cores: number
  memory_total: number
  uptime: number
  pnos_version: string
}

export interface DiskInfo {
  device: string
  mount_point: string
  fs_type: string
  total: number
  used: number
  available: number
  usage: number
}

export interface NetworkStats {
  interface: string
  rx_bytes_per_sec: number
  tx_bytes_per_sec: number
  rx_total: number
  tx_total: number
}

export interface SystemStats {
  cpu_usage: number
  cpu_per_core: number[]
  memory_total: number
  memory_used: number
  memory_usage: number
  swap_total: number
  swap_used: number
  disks: DiskInfo[]
  network: NetworkStats
  load_average: [number, number, number]
  process_count: number
}

// ===== 商店应用 =====

export interface StoreApp {
  id: string
  name: string
  version: string
  description?: string
  icon?: string
  image?: string
  categories?: string[]
  official?: boolean
  [key: string]: unknown
}

export interface StoreSource {
  id: string
  name: string
  url: string
  enabled: boolean
  [key: string]: unknown
}

export interface InstallProgress {
  phase: 'downloading' | 'extracting' | 'starting' | 'done'
  downloaded: number
  total: number | null
  message?: string
}

// ===== 运行时配置（对齐 pnos-runtime GET /api/v1/system/config，只读） =====

export interface RuntimeConfig {
  /** HTTP 服务监听端口（运行时配置文件 / PNOS_PORT） */
  port: number
  /** 应用反向代理前缀（pnos-spec protocol::APP_PROXY_PREFIX） */
  proxy_prefix: string
  /** CORS 允许来源，`["*"]` 表示允许任意来源 */
  cors_origins: string[]
}
