"""生成作品页 4 个分类 + 每类约 12 张占位图（渐变+编号），并保留原有真实照片。"""
import os, sys, random
import django

# 路径无关：以本脚本所在目录为项目根，避免硬编码 Mac 绝对路径（可在服务器上复现）
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio_project.settings')
django.setup()

from main.models import WorkCategory, WorkImage
from PIL import Image, ImageDraw, ImageFont

MEDIA = os.path.join(BASE_DIR, 'media', 'works')
os.makedirs(MEDIA, exist_ok=True)

# 每类调色板（RGB 三色，用于四角渐变）
PALETTES = {
    'portrait':  [(255, 138, 168), (255, 196, 142), (196, 132, 252)],  # 暖粉 / 橙 / 紫
    'landscape': [(86, 171, 119), (120, 198, 160), (70, 140, 200)],    # 绿 / 青绿 / 蓝
    '3d':        [(150, 110, 255), (110, 90, 220), (80, 200, 230)],     # 紫 / 深紫 / 青
    'aigc':      [(255, 160, 90),  (255, 110, 150), (90, 200, 255)],     # 橙 / 粉 / 蓝
}
LABEL = {'portrait': 'PORTRAIT', 'landscape': 'LANDSCAPE', '3d': '3D MODEL', 'aigc': 'AIGC'}

CATS = [
    ('人像摄影', 'portrait', 'portrait',   '光影与人物的情绪对话'),
    ('风景摄影', 'landscape', 'landscape', '山河湖海的自然纪实'),
    ('视觉设计', '3d-model',  '3d',        '以视觉语言构建品牌气质'),
    ('AIGC 作品', 'aigc',     'aigc',      'AI 驱动的视觉创想'),
]

# 字体（macOS 自带，仅渲染拉丁字母/数字）
FONT_PATHS = [
    '/System/Library/Fonts/Helvetica.ttc',
    '/System/Library/Fonts/Arial.ttf',
    '/Library/Fonts/Arial.ttf',
]
FONT = None
for fp in FONT_PATHS:
    if os.path.exists(fp):
        FONT = fp
        break


def load_font(size, index=0):
    if FONT and FONT.endswith('.ttc'):
        return ImageFont.truetype(FONT, size, index=index)
    if FONT:
        return ImageFont.truetype(FONT, size)
    return ImageFont.load_default()


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def four_corner_gradient(w, h, c1, c2, c3, c4):
    """2x2 四角渐变放大 -> 平滑双线性渐变"""
    base = Image.new('RGB', (2, 2))
    base.putpixel((0, 0), c1)
    base.putpixel((1, 0), c2)
    base.putpixel((0, 1), c3)
    base.putpixel((1, 1), c4)
    return base.resize((w, h), Image.BICUBIC)


def add_bottom_scrim(img):
    w, h = img.size
    scrim = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(scrim)
    steps = 60
    for i in range(steps):
        t = i / (steps - 1)
        a = int(235 * (t ** 2.2))  # 底部最深
        y0 = int(h * 0.45 + (h * 0.55) * t)
        d.rectangle([0, y0, w, h], fill=(8, 6, 4, a))
    return Image.alpha_composite(img.convert('RGBA'), scrim).convert('RGB')


def make_image(catkey, idx, total):
    vertical = (idx % 5) < 3
    w, h = (1200, 1500) if vertical else (1600, 1000)
    pal = PALETTES[catkey]
    # 每图旋转调色板，制造层次变化
    shift = idx % 3
    cols = pal[shift:] + pal[:shift]
    c1 = lerp(cols[0], cols[1], 0.15)
    c2 = cols[1]
    c3 = cols[2]
    c4 = lerp(cols[2], cols[0], 0.25)
    img = four_corner_gradient(w, h, c1, c2, c3, c4)
    img = add_bottom_scrim(img)

    d = ImageDraw.Draw(img)
    # 大编号
    num = f"{idx + 1:02d}"
    nf = load_font(int(min(w, h) * 0.40))
    bbox = d.textbbox((0, 0), num, font=nf)
    nw, nh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    nx, ny = (w - nw) / 2 - bbox[0], h * 0.42 - nh / 2 - bbox[1]
    d.text((nx + 4, ny + 4), num, font=nf, fill=(0, 0, 0, 60))  # 阴影
    d.text((nx, ny), num, font=nf, fill=(255, 255, 255))

    # 顶部类别词
    lf = load_font(int(w * 0.055))
    label = LABEL[catkey]
    lb = d.textbbox((0, 0), label, font=lf)
    lw = lb[2] - lb[0]
    lx = (w - lw) / 2 - lb[0]
    ly = h * 0.10 - lb[1]
    d.text((lx, ly), label, font=lf, fill=(255, 255, 255))

    # 底部小标
    sf = load_font(int(w * 0.032))
    sub = f"WORK {idx + 1:02d} / {total:02d}"
    sb = d.textbbox((0, 0), sub, font=sf)
    sw = sb[2] - sb[0]
    sx = (w - sw) / 2 - sb[0]
    sy = h * 0.86 - sb[1]
    d.text((sx, sy), sub, font=sf, fill=(235, 235, 245))

    fname = f"w_{catkey}_{idx + 1:02d}.jpg"
    img.save(os.path.join(MEDIA, fname), 'JPEG', quality=88)
    return fname


# ── 1. 创建 4 个分类 ──
new_cats = {}
for name, slug, key, desc in CATS:
    cat, _ = WorkCategory.objects.get_or_create(name=name, defaults={'slug': slug})
    new_cats[key] = cat
    print(f"分类: {name} (id={cat.id}, slug={slug})")

# ── 2. 保留原有真实照片，迁移到对应新分类 ──
old_map = {4: 'portrait', 5: '3d', 6: 'aigc'}  # 旧 摄影/3D设计/AI视觉
for old_id, newkey in old_map.items():
    try:
        old_cat = WorkCategory.objects.get(id=old_id)
    except WorkCategory.DoesNotExist:
        continue
    moved = 0
    for img in old_cat.images.all():
        img.category = new_cats[newkey]
        img.save()
        moved += 1
    print(f"迁移旧分类 {old_id}({old_cat.name}) -> {newkey}: {moved} 张")

# ── 3. 每类补足到 12 张 ──
TARGET = 12
for key, cat in new_cats.items():
    existing = cat.images.count()
    need = TARGET - existing
    print(f"  {cat.name}: 现有 {existing} 张，补充 {need} 张")
    for i in range(need):
        global_idx = existing + i
        fname = make_image(key, global_idx, TARGET)
        rel = f"works/{fname}"
        wi = WorkImage(category=cat, title=f"{cat.name} {global_idx + 1:02d}", image=rel,
                       display_mode='vertical' if (global_idx % 5) < 3 else 'horizontal')
        wi.save()
    print(f"  -> {cat.name} 现共 {cat.images.count()} 张")

# ── 4. 删除旧分类（图片已迁出）──
for old_id in (4, 5, 6):
    WorkCategory.objects.filter(id=old_id).delete()
print("已删除旧分类 4/5/6")

print("\n最终分类与数量：")
for c in WorkCategory.objects.all().order_by('id'):
    print(f"  {c.id}: {c.name} -> {c.images.count()} 张")
