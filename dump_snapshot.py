"""导出静态快照数据：用 Django ORM 直接读库，生成前端静态模式所需的 snapshot.json。

- 复刻 main/views.py 中各端点的序列化形状
- 把图片的绝对 URL 改为同源相对路径（去掉 scheme://host 与 ?v 缓存版本），
  以便静态部署时用 /media/... 直接命中打包进 dist 的媒体文件
- 不依赖 HTTP，绕开沙箱到宿主 localhost 的网络隔离
"""
import os
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio_project.settings')
# 允许从仓库根目录运行
ROOT = os.path.dirname(os.path.abspath(__file__))
if ROOT not in os.sys.path:
    os.sys.path.insert(0, ROOT)
django.setup()

from main.models import About, WorkCategory, WorkImage, HeroIcon


def rel(field):
    """返回图片字段的同源相对路径（如 /media/works/3d_1.jpg）"""
    if not field:
        return None
    return field.url  # 已是 MEDIA_URL + name 的形式


def thumb_of(url):
    """根据原图 URL 推导缩略图 URL：/media/works/NAME.ext -> /media/works/thumbs/NAME.jpg"""
    if not url or '/media/works/' not in url:
        return None
    name = url.rsplit('/', 1)[-1].rsplit('.', 1)[0]
    return '/media/works/thumbs/' + name + '.jpg'


snapshot = {}

# ── /about/ ──────────────────────────────────────────────
about = About.objects.prefetch_related(
    'work_experiences', 'project_experiences', 'awards'
).first()
if about:
    snapshot['/about/'] = {
        'name': about.name,
        'avatar': rel(about.avatar),
        'role': about.role,
        'school': about.school,
        'bio': about.bio,
        'phone': about.phone,
        'email': about.email,
        'location': about.location,
        'zcool': about.zcool,
        'xiaohongshu': about.xiaohongshu,
        'douyin': about.douyin,
        'stat_experience': about.stat_experience,
        'stat_projects': about.stat_projects,
        'stat_pages': about.stat_pages,
        'work_experiences': [
            {'period': e.period, 'title': e.title, 'company': e.company, 'description': e.description}
            for e in about.work_experiences.all()
        ],
        'project_experiences': [
            {'period': e.period, 'title': e.title, 'company': e.company, 'description': e.description}
            for e in about.project_experiences.all()
        ],
        'awards': [
            {'year': a.year, 'name': a.name, 'organization': a.organization}
            for a in about.awards.all()
        ],
    }

# ── /works/categories/ ───────────────────────────────────
categories = WorkCategory.objects.all().prefetch_related('images')
cat_list = []
for cat in categories:
    imgs = list(cat.images.all().order_by('title'))
    cat_list.append({
        'id': cat.id,
        'name': cat.name,
        'slug': cat.slug,
        'count': len(imgs),
        'cover': rel(imgs[0].image) if imgs else None,
        'cover_thumb': thumb_of(rel(imgs[0].image)) if imgs else None,
        'preview_works': [img.title for img in imgs[:5]] if imgs else [],
    })
snapshot['/works/categories/'] = cat_list

# ── /works/<id>/ ────────────────────────────────────────
for cat in categories:
    imgs = cat.images.all().order_by('title')
    snapshot[f'/works/{cat.id}/'] = [
        {'id': img.id, 'title': img.title, 'image': rel(img.image),
         'thumbnail': thumb_of(rel(img.image)), 'display_mode': img.display_mode}
        for img in imgs
    ]

# ── /hero-icons/ ────────────────────────────────────────
snapshot['/hero-icons/'] = [
    {
        'key': i.key,
        'label': i.label,
        'image': rel(i.image),
        'pos_x': i.pos_x,
        'pos_y': i.pos_y,
        'width': i.width,
        'rotation': i.rotation,
        'z_index': i.z_index,
        'order': i.order,
    }
    for i in HeroIcon.objects.all().order_by('order')
]

out_path = os.path.join(ROOT, 'frontend', 'src', 'api', 'snapshot.json')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(snapshot, f, ensure_ascii=False, indent=2)

print('✅ 快照已生成:', out_path)
for k, v in snapshot.items():
    n = len(v) if isinstance(v, list) else 1
    print(f'   {k}  ->  {n} 项')
