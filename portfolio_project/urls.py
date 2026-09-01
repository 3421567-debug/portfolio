from django.contrib import admin
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from main.views import (
    health_check, about_detail, work_categories, work_images,
    hero_icons, hero_icons_save, hero_icon_image, hero_editor,
    hero_config, hero_config_save, hero_config_background, home_manager,
)

urlpatterns = [
    # 自定义后台页面必须放在 admin/ 之前，否则会被 admin 的 catch-all 通配拦截
    path('admin/hero-editor/', hero_editor, name='hero-editor'),
    path('admin/home-manager/', home_manager, name='home-manager'),
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/about/', about_detail, name='about-detail'),
    path('api/works/categories/', work_categories, name='work-categories'),
    path('api/works/<int:category_id>/', work_images, name='work-images'),
    path('api/hero-icons/', hero_icons, name='hero-icons'),
    path('api/hero-icons/save/', hero_icons_save, name='hero-icons-save'),
    path('api/hero-icons/<str:key>/image/', hero_icon_image, name='hero-icon-image'),
    path('api/hero-config/', hero_config, name='hero-config'),
    path('api/hero-config/save/', hero_config_save, name='hero-config-save'),
    path('api/hero-config/background/', hero_config_background, name='hero-config-background'),
]

if settings.DEBUG:
    # 开发环境：Django 直接托管媒体文件
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # 生产环境：Django 同时托管前端 SPA（/）与媒体文件（/media/）
    # 后台/admin 与前端打包资源（/static/）由 whitenoise 托管
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
        # 非 API / 非后台 / 非静态 / 非媒体的所有前端路由都回退到 SPA 入口
        re_path(r'^(?!api/|admin/|static/|media/).*$',
                TemplateView.as_view(template_name='index.html')),
    ]
