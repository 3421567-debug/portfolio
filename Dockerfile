# ───────── 阶段 1：构建前端 ─────────
FROM node:22-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# 资源输出到 /static/ 下，由 Django(whitenoise) 统一托管
RUN VITE_BASE=/static/ npm run build

# ───────── 阶段 2：Python 运行环境 ─────────
FROM python:3.13-slim AS runtime
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_DEBUG=False

WORKDIR /app

# Pillow 所需系统库
RUN apt-get update && apt-get install -y --no-install-recommends \
        libjpeg62-turbo zlib1g libopenjp2-7 libtiff6 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码与数据（db.sqlite3 / media 已随仓库提交，部署即有完整内容）
COPY . .

# 把前端打包产物从阶段 1 拷入
COPY --from=frontend /app/frontend/dist ./frontend/dist

# 收集静态资源（后台/admin + 前端打包）
RUN python manage.py collectstatic --noinput

EXPOSE 8000
ENTRYPOINT ["./start.sh"]
