#!/bin/bash
# 容器启动入口：迁移数据库 → 必要时填充示例数据 → 收集静态资源 → 启动 gunicorn
set -e
cd /app

echo "==> 数据库迁移"
python manage.py migrate --noinput

echo "==> 若作品数据为空则填充示例作品（保留已有真实照片）"
python - <<'PY'
import os, django, subprocess
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio_project.settings')
django.setup()
from main.models import WorkCategory
if WorkCategory.objects.count() == 0:
    print("无作品数据，生成示例作品...")
    subprocess.run(['python', 'gen_works_data.py'])
PY

echo "==> 收集静态资源（whitenoise 托管）"
python manage.py collectstatic --noinput

echo "==> 启动 gunicorn"
exec gunicorn portfolio_project.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 60
