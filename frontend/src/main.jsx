import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@fontsource/inter'        // 本地化 Inter，替代墙外 Google Fonts，消除首屏阻塞
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
