# AGENT.md — Portfolio 全栈项目开发指南

> **角色**：你是本项目的 AI 协作开发助手。项目主人是设计师，不懂代码，沟通用中文，避免代码细节，多给可视化/文档化产出。

---

## 1. 项目身份

| 属性 | 值 |
|------|-----|
| 项目名称 | Portfolio（作品集网站） |
| 项目根目录 | `/Users/fan/Desktop/portfolio/` |
| 架构模式 | 前后端分离（React 19 SPA + Django REST API） |
| 项目阶段 | 脚手架搭建完成，功能待开发 |

---

## 2. 技术栈

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.13.12（managed） | 运行时 |
| Django | 6.0.7 | Web 框架 |
| Django REST Framework | 3.17.1 | REST API |
| django-cors-headers | 4.9.0 | 跨域支持 |
| django-simpleui | 2026.1.13 | 后台 UI 美化 |
| SQLite | - | 开发数据库 |
| pip 镜像 | `https://pypi.tuna.tsinghua.edu.cn/simple` | 加速下载 |

### 前端

> ⚠️ 注意：本文件原始版本描述的是 **Vue 3 + Element Plus** 方案，但实际代码已改为 **React 19 + Vite**（见下方）。以代码为准。

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 22.22.2（managed） | 运行时 |
| React | 19.2.7 | 前端框架 |
| Vite | 8.1.4 | 构建工具/开发服务器 |
| react-router-dom | 7.18.1 | 路由（当前为单页滚动，路由未充分使用） |
| framer-motion | 12.42.2 | 动画 |
| react-icons | 5.7.0 | 图标库 |
| ogl | - | WebGL 极光背景着色器（Aurora 组件） |
| Axios | 1.18.1 | HTTP 客户端 |
| npm 镜像 | `https://registry.npmmirror.com` | 加速下载 |

---

## 3. 架构设计

```
┌─────────────────────────────────────────────────┐
│                  浏览器 (localhost:3000)           │
│          Vue 3 SPA (Element Plus UI)              │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Router   │  │  Pinia    │  │  Axios API   │   │
│  │ (views/)  │  │ (stores/) │  │  (api/)      │   │
│  └──────────┘  └──────────┘  └──────┬───────┘   │
│                                      │            │
└──────────────────────────────────────┼────────────┘
                                       │ /api/*
                              Vite Proxy (dev)
                                       │
┌──────────────────────────────────────┼────────────┐
│                          Django (localhost:8000)   │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Admin    │  │  DRF API │  │  main App    │   │
│  │ (SimpleUI)│  │ (REST)   │  │  (业务逻辑)   │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
│                                                   │
│  ┌──────────────────────────────────────────┐    │
│  │              SQLite (db.sqlite3)           │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

**关键设计**：
- **开发环境**：Vite 开发服务器在 3000 端口，通过内置 proxy 将 `/api` 和 `/admin` 请求转发到 Django 8000 端口。前端无需处理 CORS。
- **生产环境**：Vue 构建产物（`frontend/dist/`）由 Django 作为静态文件服务，或部署到 CDN。
- **后台管理**：`/admin` 由 SimpleUI 美化，独立于 Vue 前端。

---

## 4. 目录结构

```
portfolio/
├── AGENT.md                        # ← 本文件
├── manage.py                       # Django CLI 入口
├── db.sqlite3                      # SQLite 数据库文件
│
├── venv/                           # Python 虚拟环境（不提交 Git）
│   └── ... (Python 3.13.12, 包列表见 requirements)
│
├── portfolio_project/              # Django 项目配置包
│   ├── __init__.py
│   ├── settings.py                 # ★ 核心配置
│   ├── urls.py                     # ★ URL 路由
│   ├── wsgi.py                     # WSGI 部署入口
│   └── asgi.py                     # ASGI 部署入口
│
├── main/                           # Django 主应用
│   ├── __init__.py
│   ├── admin.py                    # 后台模型注册
│   ├── apps.py                     # 应用配置
│   ├── models.py                   # 数据模型（待建）
│   ├── views.py                    # API 视图（health-check 已建）
│   ├── tests.py                    # 测试
│   └── migrations/                 # 数据库迁移
│
└── frontend/                       # Vue 3 前端项目（独立 npm 项目）
    ├── package.json                # ★ npm 依赖
    ├── vite.config.js              # ★ Vite 配置（代理、别名）
    ├── index.html                  # HTML 入口
    ├── public/                     # 静态资源（不经过构建）
    │   └── favicon.svg
    ├── src/
    │   ├── main.js                 # ★ Vue 入口（插件注册）
    │   ├── App.vue                 # ★ 根组件（布局框架）
    │   ├── style.css               # 全局样式
    │   ├── router/
    │   │   └── index.js            # ★ 路由配置
    │   ├── stores/                 # Pinia 状态管理（待建）
    │   ├── api/
    │   │   └── index.js            # ★ Axios 封装
    │   ├── views/
    │   │   ├── HomeView.vue        # 首页
    │   │   └── AboutView.vue       # 关于页
    │   ├── components/             # 公共组件（待建）
    │   ├── layouts/                # 布局组件（待建）
    │   └── assets/                 # 需要构建处理的资源
    └── dist/                       # 构建产物（npm run build 后生成）
```

---

## 5. 后端详解

### 5.1 Django Settings 关键配置

文件：`portfolio_project/settings.py`

```python
# 已注册应用
INSTALLED_APPS = [
    'simpleui',                    # 后台 UI（必须在 admin 前）
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',              # DRF
    'corsheaders',                 # CORS
    'main',                        # 业务应用
]

# 中间件（CORS 在最前）
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 必须在 SecurityMiddleware 前
    ...
]

# 数据库
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}

# 国际化
LANGUAGE_CODE = 'zh-hans'
TIME_ZONE = 'Asia/Shanghai'

# SimpleUI
SIMPLEUI_HOME_INFO = False
SIMPLEUI_ANALYSIS = False

# CORS（开发环境全开）
CORS_ALLOW_ALL_ORIGINS = True
```

### 5.2 URL 路由

文件：`portfolio_project/urls.py`

| 路径 | 处理 | 说明 |
|------|------|------|
| `admin/` | Django Admin (SimpleUI) | 后台管理 |
| `api/health/` | `main.views.health_check` | 健康检查（GET） |

### 5.3 当前 API 端点

**GET `/api/health/`** — 健康检查

响应示例：
```json
{
  "status": "ok",
  "message": "Portfolio API is running",
  "frontend": "Vue 3 + Vite",
  "backend": "Django 6.0 + DRF"
}
```

### 5.4 超级管理员

| 字段 | 值 |
|------|-----|
| 用户名 | `yangfan` |
| 密码 | `qq3421567` |
| 邮箱 | `3421567@qq.com` |
| 昵称 | `fan` |

### 5.5 数据模型

`main/models.py` 当前为空。添加新模型后需执行：
```bash
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
```

---

## 6. 前端详解

### 6.1 Vue 入口

文件：`frontend/src/main.js`

插件加载顺序：Pinia → Router → Element Plus（中文 locale）→ Element Plus Icons（全局注册）

### 6.2 路由表

文件：`frontend/src/router/index.js`

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/` | home | `@/views/HomeView.vue` | 首页（英雄区+特性卡片） |
| `/about` | about | `@/views/AboutView.vue` | 关于页（技术栈+目录树） |

路由模式：`createWebHistory()`（无 `#` 的干净 URL）

### 6.3 API 层

文件：`frontend/src/api/index.js`

- `baseURL: '/api'` — 所有 API 请求以 `/api` 为前缀
- 超时：10 秒
- 响应拦截器自动解包 `response.data`
- 开发时 Vite 代理将 `/api/*` 转发至 `http://127.0.0.1:8000`

使用示例：
```js
import api from '@/api'
api.get('/health/').then(data => console.log(data))
```

### 6.4 组件树

```
App.vue (根布局)
├── el-header (导航栏)
│   ├── logo → router.push('/')
│   └── el-menu (首页 / 关于)
├── el-main
│   └── <router-view />
│       ├── HomeView.vue      路由: /
│       │   ├── hero 区
│       │   └── 三栏特性卡片
│       └── AboutView.vue     路由: /about
│           ├── 技术栈表格
│           └── 项目结构树
└── el-footer (版权信息)
```

### 6.5 Vite 配置

文件：`frontend/vite.config.js`

- **别名**：`@` → `src/`
- **开发服务器**：端口 3000
- **代理规则**：
  - `/api` → `http://127.0.0.1:8000`
  - `/admin` → `http://127.0.0.1:8000`
- **构建输出**：`dist/` 目录

---

## 7. 开发工作流

### 7.1 启动全部服务

```bash
# 终端 1：启动 Django 后端
cd /Users/fan/Desktop/portfolio
source venv/bin/activate
python manage.py runserver
# → http://127.0.0.1:8000

# 终端 2：启动 Vue 前端
cd /Users/fan/Desktop/portfolio/frontend
npm run dev
# → http://localhost:3000
```

> 开发时访问 `localhost:3000`，Vite 代理会自动处理 API 转发。

### 7.2 安装新包

```bash
# Python 包（必须使用清华镜像）
source venv/bin/activate
pip install <package> -i https://pypi.tuna.tsinghua.edu.cn/simple

# Node 包（必须使用 npmmirror 镜像）
cd frontend
npm install <package> --registry=https://registry.npmmirror.com
```

### 7.3 常用命令

```bash
# Django
python manage.py startapp <app_name>      # 新建应用
python manage.py makemigrations           # 生成迁移
python manage.py migrate                  # 执行迁移
python manage.py createsuperuser          # 创建管理员
python manage.py shell                    # Django Shell

# Vue
cd frontend
npm run dev         # 开发模式
npm run build       # 生产构建 → dist/
npm run preview     # 预览构建产物
```

### 7.4 运行时路径速查

| 资源 | 绝对路径 |
|------|---------|
| Python 解释器 | `/Users/fan/Desktop/portfolio/venv/bin/python3` |
| Node 可执行文件 | `/Users/fan/.workbuddy/binaries/node/versions/22.22.2/bin/node` |
| npm 可执行文件 | `/Users/fan/.workbuddy/binaries/node/versions/22.22.2/bin/npm` |
| pip 可执行文件 | `/Users/fan/Desktop/portfolio/venv/bin/pip` |

---

## 8. 项目当前状态

### ✅ 已完成

- [x] Python 虚拟环境创建（Python 3.13.12）
- [x] Django 项目骨架搭建
- [x] DRF + CORS 集成
- [x] SimpleUI 后台美化
- [x] 超级管理员创建
- [x] React 19 + Vite 脚手架
- [x] 暗/亮主题系统（ThemeContext）
- [x] 组件体系：Hero / Navbar / Works / About / Contact / ImageModal / Aurora
- [x] Axios API 层封装（baseURL `/api`，Vite 代理至 Django 8000）
- [x] Vite 代理配置（/api、/admin、/media）
- [x] 健康检查 API

### ⬜ 待开发 / 待完善

- [x] 数据模型设计（`main/models.py` 已完成：About / WorkCategory / WorkImage / 经历 / 奖项）
- [x] 业务 API 开发（作品分类、作品列表、关于页，均已实现）
- [ ] 前端页面视觉深化（Hero 文案、作品详情页、动画打磨等）
- [ ] 后台填充真实内容（通过 /admin 上传作品、编辑关于页）
- [ ] 生产环境部署方案
- [ ] 用户认证（如需）
- [ ] 图片/文件上传（后台已支持，待真实素材）

---

## 9. 开发约定

### 9.1 新增 Django API

1. 在 `main/views.py` 中编写视图函数/类
2. 使用 DRF 的 `@api_view` 装饰器或 `APIView` 类
3. 在 `portfolio_project/urls.py` 注册路由，统一使用 `api/` 前缀
4. 前端通过 `@/api` 模块调用

### 9.2 新增 Vue 页面

1. 在 `frontend/src/views/` 创建 `.vue` 文件
2. 在 `frontend/src/router/index.js` 的 `routes` 数组中添加路由
3. 导航菜单项在 `App.vue` 的 `<el-menu>` 中添加

### 9.3 新增 Pinia Store

1. 在 `frontend/src/stores/` 创建 store 文件
2. 在组件中通过 `import { useXxxStore } from '@/stores/xxx'` 使用

### 9.4 代码风格

- **Vue 组件**：使用 `<script setup>` 语法
- **API 调用**：统一通过 `@/api` 模块，不直接使用 axios
- **CSS**：组件内使用 `<style scoped>`，全局样式放 `style.css`
- **Django 视图**：优先使用 DRF 的 `@api_view` 或 `APIView`

---

## 10. 部署提示

### 生产构建

```bash
# 1. 构建前端
cd frontend
npm run build
# 产物在 frontend/dist/

# 2. 方案一：Django 服务静态文件
# 将 dist/ 内容复制到 Django STATIC_ROOT，或配置 STATICFILES_DIRS

# 3. 方案二：Nginx 反向代理
# Vue 构建产物由 Nginx 直接服务
# /api/* 和 /admin/* 代理到 Django
```

### 生产检查清单

- [ ] `DEBUG = False`
- [ ] `ALLOWED_HOSTS` 配置正确域名
- [ ] `SECRET_KEY` 使用环境变量
- [ ] CORS 限制具体域名（不用 `*`）
- [ ] 数据库切换为 PostgreSQL（生产推荐）
- [ ] 静态文件收集：`python manage.py collectstatic`

---

## 11. 依赖清单

### Python（当前已安装）

```
asgiref==3.12.1
Django==6.0.7
django-cors-headers==4.9.0
djangorestframework==3.17.1
django-simpleui==2026.1.13
sqlparse==0.5.5
```

### Node（当前已安装，见 frontend/package.json）

```json
{
  "dependencies": {
    "@element-plus/icons-vue": "^2.3.2",
    "axios": "^1.18.1",
    "element-plus": "^2.14.3",
    "pinia": "^3.0.4",
    "vue": "^3.5.39",
    "vue-router": "^4.6.4"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.7",
    "vite": "^8.1.1"
  }
}
```

---

> **最后更新**：2026-07-15 — 初始版本，覆盖项目脚手架阶段的全部信息。
