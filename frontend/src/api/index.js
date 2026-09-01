import axios from 'axios'
import snapshot from './snapshot.json'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('API Error:', err)
    return Promise.reject(err)
  }
)

// ── 静态快照模式 ────────────────────────────────────────────
// 构建时传入 VITE_STATIC=1 即启用：直接返回打包进来的快照数据，
// 不向后端发任何请求（用于无后端纯静态部署）。
const STATIC = import.meta.env.VITE_STATIC === '1'
if (STATIC) {
  // eslint-disable-next-line no-console
  console.info('[static-snapshot] 使用打包快照数据，未连接后端')
  api.get = (url) => Promise.resolve(snapshot[url] ?? null)
  api.post = () => Promise.resolve({ ok: true })
}

export default api
