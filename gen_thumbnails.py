"""生成作品缩略图并注入 snapshot。

1) 为 media/works 全部图片生成缩略图（最长边 1000px, JPEG q82），
   同时写入 media/works/thumbs 与 frontend/public/media/works/thumbs 两处副本。
2) 给 frontend/src/api/snapshot.json 的每个 works image / 分类 cover 注入
   thumbnail / cover_thumb 字段，供前端画廊网格使用（原图保留给全屏大图）。
"""
import os
import json
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))

# 两处副本：Django 后端 media 与前端部署用的 public/media
WORK_DIRS = [
    os.path.join(ROOT, 'media', 'works'),
    os.path.join(ROOT, 'frontend', 'public', 'media', 'works'),
]

THUMB_MAX = 800       # 缩略图最长边(px)：网格列宽仅~300px(CSS)，2x 视网膜也只需~600px，800px 足够清晰且比 1000px 小约 30%
QUALITY = 82          # JPEG 质量

EXTS = ('.jpg', '.jpeg', '.png', '.webp')


def make_thumb(src_path, thumb_path):
    """生成缩略图；已存在且比源新则跳过。返回是否真正生成。"""
    try:
        src_mtime = os.path.getmtime(src_path)
    except OSError:
        return False
    if os.path.exists(thumb_path) and os.path.getmtime(thumb_path) >= src_mtime:
        return False
    os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
    with Image.open(src_path) as im:
        im = im.convert('RGB')
        w, h = im.size
        scale = min(THUMB_MAX / w, THUMB_MAX / h, 1.0)
        if scale < 1.0:
            im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))),
                           Image.LANCZOS)
        im.save(thumb_path, 'JPEG', quality=QUALITY, optimize=True, progressive=True)
    return True


# ── 1. 生成缩略图文件（两处副本） ──────────────────────────
gen_count = 0
for wd in WORK_DIRS:
    if not os.path.isdir(wd):
        print('⚠️ 跳过不存在目录:', wd)
        continue
    for fn in sorted(os.listdir(wd)):
        if fn.lower().endswith(EXTS):
            src = os.path.join(wd, fn)
            base = os.path.splitext(fn)[0]
            thumb = os.path.join(wd, 'thumbs', base + '.jpg')
            if make_thumb(src, thumb):
                gen_count += 1
print(f'✅ 缩略图生成/更新 {gen_count} 张')


# ── 2. 注入 snapshot thumbnail 字段 ───────────────────────
SNAP = os.path.join(ROOT, 'frontend', 'src', 'api', 'snapshot.json')


def thumb_of(url):
    """ /media/works/NAME.ext -> /media/works/thumbs/NAME.jpg """
    if not url or '/media/works/' not in url:
        return None
    name = url.rsplit('/', 1)[-1].rsplit('.', 1)[0]
    return '/media/works/thumbs/' + name + '.jpg'


with open(SNAP, encoding='utf-8') as f:
    snap = json.load(f)

changed = 0
for cat in snap.get('/works/categories/', []):
    if cat.get('cover'):
        cat['cover_thumb'] = thumb_of(cat['cover'])
        changed += 1

for key in list(snap.keys()):
    if key.startswith('/works/') and key != '/works/categories/':
        for img in snap[key]:
            if img.get('image'):
                img['thumbnail'] = thumb_of(img['image'])
                changed += 1

with open(SNAP, 'w', encoding='utf-8') as f:
    json.dump(snap, f, ensure_ascii=False, indent=2)
print(f'✅ snapshot.json 注入 thumbnail 字段 {changed} 处')
