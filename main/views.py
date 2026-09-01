from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from .models import About, WorkCategory, WorkImage, HeroIcon, HeroConfig, FONT_CHOICES

# 媒体资源缓存破坏版本号：作品图替换后 +1 可强制浏览器重新拉取（避免同名 URL 命中旧缓存）
MEDIA_CACHE_VERSION = 'v2'


def _abs_media(request, image_field):
    if not image_field:
        return None
    return request.build_absolute_uri(image_field.url) + '?' + MEDIA_CACHE_VERSION


@api_view(['GET'])
def health_check(request):
    """健康检查"""
    return Response({
        'status': 'ok',
        'message': 'Portfolio API is running',
    })


@api_view(['GET'])
def about_detail(request):
    """获取关于页面数据"""
    try:
        about = About.objects.prefetch_related(
            'work_experiences', 'project_experiences', 'awards'
        ).first()
    except About.DoesNotExist:
        return Response({'error': '数据未配置'}, status=404)

    if not about:
        return Response({'error': '数据未配置'}, status=404)

    return Response({
        'name': about.name,
        'avatar': request.build_absolute_uri(about.avatar.url) if about.avatar else None,
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
            {
                'period': exp.period,
                'title': exp.title,
                'company': exp.company,
                'description': exp.description,
            } for exp in about.work_experiences.all()
        ],
        'project_experiences': [
            {
                'period': exp.period,
                'title': exp.title,
                'company': exp.company,
                'description': exp.description,
            } for exp in about.project_experiences.all()
        ],
        'awards': [
            {
                'year': award.year,
                'name': award.name,
                'organization': award.organization,
            } for award in about.awards.all()
        ],
    })


@api_view(['GET'])
def work_categories(request):
    """获取作品分类列表（含封面图、作品数、预览标题列表）"""
    categories = WorkCategory.objects.all().prefetch_related('images')
    result = []
    for cat in categories:
        imgs = list(cat.images.all().order_by('title'))
        result.append({
            'id': cat.id,
            'name': cat.name,
            'slug': cat.slug,
            'count': len(imgs),
            'cover': _abs_media(request, imgs[0].image) if imgs else None,
            'preview_works': [img.title for img in imgs[:5]] if imgs else [],
        })
    return Response(result)


@api_view(['GET'])
def work_images(request, category_id):
    """获取指定分类下的作品图片"""
    try:
        category = WorkCategory.objects.get(id=category_id)
    except WorkCategory.DoesNotExist:
        return Response({'error': '分类不存在'}, status=404)

    images = category.images.all().order_by('title')
    return Response([
        {
            'id': img.id,
            'title': img.title,
            'image': _abs_media(request, img.image),
            'display_mode': img.display_mode,
        } for img in images
    ])


def _serialize_icon(icon, request):
    return {
        'key': icon.key,
        'label': icon.label,
        'image': request.build_absolute_uri(icon.image.url) if icon.image else None,
        'pos_x': icon.pos_x,
        'pos_y': icon.pos_y,
        'width': icon.width,
        'rotation': icon.rotation,
        'z_index': icon.z_index,
        'order': icon.order,
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def hero_icons(request):
    """获取首页漂浮图标列表（公开）"""
    icons = HeroIcon.objects.all().order_by('order')
    return Response([_serialize_icon(i, request) for i in icons])


@api_view(['POST'])
@permission_classes([IsAdminUser])
def hero_icons_save(request):
    """批量保存图标坐标 / 尺寸（管理员）"""
    icons = request.data.get('icons', [])
    if not isinstance(icons, list):
        return Response({'error': 'icons 必须是数组'}, status=400)
    updated = []
    for item in icons:
        try:
            icon = HeroIcon.objects.get(key=item['key'])
        except (HeroIcon.DoesNotExist, KeyError):
            continue
        for field in ('pos_x', 'pos_y', 'width', 'rotation', 'z_index'):
            if field in item:
                setattr(icon, field, item[field])
        icon.save()
        updated.append(item.get('key'))
    return Response({'ok': True, 'updated': updated})


@api_view(['POST'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def hero_icon_image(request, key):
    """替换单个图标的图片（管理员，multipart）"""
    try:
        icon = HeroIcon.objects.get(key=key)
    except HeroIcon.DoesNotExist:
        return Response({'error': '图标不存在'}, status=404)
    if 'image' not in request.FILES:
        return Response({'error': '缺少 image 文件'}, status=400)
    icon.image = request.FILES['image']
    icon.save()
    return Response({'ok': True, 'key': key, 'image': request.build_absolute_uri(icon.image.url)})


def _serialize_config(cfg, request):
    return {
        'title_line1': cfg.title_line1,
        'title_line2': cfg.title_line2,
        'title_size': cfg.title_size,
        'title_font_family': cfg.title_font_family,
        'title_gradient': cfg.title_gradient,
        'title_gradient_light': cfg.title_gradient_light,
        'title_gradient_dark': cfg.title_gradient_dark,
        'bg_type': cfg.bg_type,
        'bg_image': request.build_absolute_uri(cfg.bg_image.url) if cfg.bg_image else None,
        'bg_video': request.build_absolute_uri(cfg.bg_video.url) if cfg.bg_video else None,
        'bg_video_poster': request.build_absolute_uri(cfg.bg_video_poster.url) if cfg.bg_video_poster else None,
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def hero_config(request):
    """获取首页整体配置（公开）"""
    cfg = HeroConfig.get_active()
    return Response(_serialize_config(cfg, request))


@api_view(['POST'])
@permission_classes([IsAdminUser])
def hero_config_save(request):
    """保存标题相关配置（管理员，JSON）"""
    cfg = HeroConfig.get_active()
    allowed = ('title_line1', 'title_line2', 'title_size', 'title_font_family',
               'title_gradient', 'title_gradient_light', 'title_gradient_dark')
    for field in allowed:
        if field in request.data:
            val = request.data[field]
            if field == 'title_size':
                try:
                    val = int(val)
                except (TypeError, ValueError):
                    return Response({'error': 'title_size 必须是整数'}, status=400)
            setattr(cfg, field, val)
    cfg.save()
    return Response({'ok': True, **_serialize_config(cfg, request)})


@api_view(['POST'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def hero_config_background(request):
    """保存背景配置（管理员，multipart 或 JSON）"""
    cfg = HeroConfig.get_active()
    if 'bg_type' in request.data:
        cfg.bg_type = request.data['bg_type']
    for field in ('bg_image', 'bg_video', 'bg_video_poster'):
        if field in request.FILES:
            setattr(cfg, field, request.FILES[field])
    cfg.save()
    return Response({'ok': True, **_serialize_config(cfg, request)})


from django.contrib.auth.decorators import login_required, user_passes_test
from django.utils.html import json_script
from django.views.decorators.csrf import ensure_csrf_cookie


@login_required
@user_passes_test(lambda u: u.is_staff)
@ensure_csrf_cookie
def hero_editor(request):
    """后台拖拽排版编辑器：仿首屏舞台，拖拽定位 + 替换图片"""
    icons = HeroIcon.objects.all().order_by('order')
    icons_json = [
        {
            'key': i.key,
            'label': i.label,
            'image': request.build_absolute_uri(i.image.url) if i.image else '',
            'pos_x': i.pos_x,
            'pos_y': i.pos_y,
            'width': i.width,
            'z_index': i.z_index,
        } for i in icons
    ]
    # (icons_json 已含完整字段，无需再调用 _serialize_icon)
    csrf_token = request.META.get('CSRF_COOKIE', '')
    return render(request, 'main/hero_editor.html', {
        'icons_json': json_script(icons_json, 'hero-icons-data'),
        'csrf_token': csrf_token,
    })


@login_required
@user_passes_test(lambda u: u.is_staff)
@ensure_csrf_cookie
def home_manager(request):
    """首页管理统一编辑器：背景 + 标题 + 图标，一个页面搞定"""
    icons = HeroIcon.objects.all().order_by('order')
    icons_json = [
        {
            'key': i.key,
            'label': i.label,
            'image': request.build_absolute_uri(i.image.url) if i.image else '',
            'pos_x': i.pos_x,
            'pos_y': i.pos_y,
            'width': i.width,
            'rotation': i.rotation,
            'z_index': i.z_index,
        } for i in icons
    ]
    cfg = HeroConfig.get_active()
    config_json = {
        'title_line1': cfg.title_line1,
        'title_line2': cfg.title_line2,
        'title_size': cfg.title_size,
        'title_font_family': cfg.title_font_family,
        'title_gradient': cfg.title_gradient,
        'title_gradient_light': cfg.title_gradient_light,
        'title_gradient_dark': cfg.title_gradient_dark,
        'bg_type': cfg.bg_type,
        'bg_image': request.build_absolute_uri(cfg.bg_image.url) if cfg.bg_image else '',
        'bg_video': request.build_absolute_uri(cfg.bg_video.url) if cfg.bg_video else '',
        'bg_video_poster': request.build_absolute_uri(cfg.bg_video_poster.url) if cfg.bg_video_poster else '',
    }
    font_choices = [{'value': v, 'label': l} for v, l in FONT_CHOICES]
    csrf_token = request.META.get('CSRF_COOKIE', '')
    return render(request, 'main/home_manager.html', {
        'icons_json': json_script(icons_json, 'hero-icons-data'),
        'config_json': json_script(config_json, 'hero-config-data'),
        'font_choices': json_script(font_choices, 'font-choices-data'),
        'csrf_token': csrf_token,
    })
