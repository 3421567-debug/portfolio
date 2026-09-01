import './AppBackground.css'

/**
 * 全站统一连续背景层。
 * 固定在视口、z-index:-1、不拦截事件；所有页面区块改为透明后共用此层，
 * 从而消除 Hero / About / Works / Contact 之间“各自成块”的割裂感。
 *
 * 视觉语言（深浅主题各一套变量）：
 *  - 统一底色 + 多处主题色模糊色斑（大尺寸 + 重模糊 + 有机圆角）自然弥散
 *  - 色斑以极慢速度轻微漂移，营造氛围而不喧宾夺主
 *  - 暗角聚焦中心内容、增加纵深
 * 主题切换时通过 CSS 变量整体替换，两种模式协调统一。
 */
export default function AppBackground() {
  return (
    <div className="app-background" aria-hidden="true">
      <span className="bg-blob bg-blob--1" />
      <span className="bg-blob bg-blob--2" />
      <span className="bg-blob bg-blob--3" />
      <span className="bg-blob bg-blob--4" />
      <span className="bg-vignette" />
    </div>
  )
}
