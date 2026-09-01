// 让资源 URL 兼容任意部署 base：
// - 根路径部署（本地 / CloudStudio）→ base 为 "/"
// - GitHub Pages 项目页 → base 为 "/portfolio/"
// 仅处理以 "/" 开头的同源绝对路径；外链(http) 与已是相对路径的保持原样返回。
export function asset(url) {
  if (!url || typeof url !== 'string') return url
  if (/^https?:\/\//.test(url)) return url
  if (url.startsWith('/')) {
    const base = import.meta.env.BASE_URL || '/'
    return base.replace(/\/$/, '') + url
  }
  return url
}
