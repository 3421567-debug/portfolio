#!/bin/bash
# 部署构建脚本：先构建前端，再收集静态资源（后台/admin + 前端打包产物）
set -e

echo "==> Installing frontend dependencies & building"
cd frontend
npm install
VITE_BASE=/static/ npm run build
cd ..

echo "==> Collecting static files (whitenoise will serve them)"
python manage.py collectstatic --noinput

echo "==> Build finished"
