/**
 * 将接口返回或库里的上传路径转为浏览器可请求的 URL。
 * 开发环境 Vite 只代理 /api，故需带 context-path；历史数据可能存为 /uploads/... 无 /api 前缀。
 */
export function resolveUploadUrl(path) {
  if (!path || typeof path !== 'string') return ''
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('/api/')) return path
  const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
  if (path.startsWith('/uploads/')) {
    return `${base}${path}`
  }
  return path
}
