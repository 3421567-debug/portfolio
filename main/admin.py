from django.contrib import admin
from .models import About, WorkExperience, ProjectExperience, Award, WorkCategory, WorkImage, HeroIcon, HeroConfig


class HeroIconAdmin(admin.ModelAdmin):
    list_display = ('label', 'key', 'image_preview', 'pos_x', 'pos_y', 'width', 'z_index', 'order')
    readonly_fields = ('image_preview',)
    fields = ('key', 'label', 'image', 'image_preview', 'pos_x', 'pos_y', 'width', 'z_index', 'order')

    @admin.display(description='预览')
    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" style="max-width:80px;max-height:80px;" />'
        return '-'
    image_preview.allow_tags = True


class WorkExperienceInline(admin.TabularInline):
    model = WorkExperience
    extra = 0
    can_delete = True  # 保留删除能力（表单提交时生效）
    fields = ('period', 'title', 'company', 'description', 'order')
    # 用 verbose_name 让表头更友好
    formfield_overrides = {
        # 不覆盖，保持默认即可
    }

    def has_delete_permission(self, request, obj=None):
        return True


class ProjectExperienceInline(admin.TabularInline):
    model = ProjectExperience
    extra = 0
    can_delete = True
    fields = ('period', 'title', 'company', 'description', 'order')  # 与工作经历一致

    def has_delete_permission(self, request, obj=None):
        return True


class AwardInline(admin.TabularInline):
    model = Award
    extra = 0
    can_delete = True
    fields = ('year', 'name', 'organization', 'order')

    def has_delete_permission(self, request, obj=None):
        return True


@admin.register(About)
class AboutAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'school', 'updated_at')
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'avatar', 'role', 'school', 'bio')
        }),
        ('联系方式', {
            'fields': ('phone', 'email', 'location')
        }),
        ('社交链接', {
            'fields': ('zcool', 'xiaohongshu', 'douyin')
        }),
        ('数据指标', {
            'fields': ('stat_experience', 'stat_projects', 'stat_pages')
        }),
    )
    inlines = [WorkExperienceInline, ProjectExperienceInline, AwardInline]
    save_on_top = True
    change_form_template = 'admin/main/about/change_form.html'

    def has_add_permission(self, request):
        return not About.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


class WorkImageInline(admin.TabularInline):
    model = WorkImage
    extra = 1
    fields = ('title', 'image', 'display_mode', 'order')


@admin.register(WorkCategory)
class WorkCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [WorkImageInline]


@admin.register(WorkImage)
class WorkImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'display_mode', 'uploaded_at')
    list_filter = ('category', 'display_mode')
    search_fields = ('title',)


@admin.register(HeroIcon)
class HeroIconAdmin(admin.ModelAdmin):
    list_display = ('label', 'key', 'image_preview', 'pos_x', 'pos_y', 'width', 'z_index', 'order')
    readonly_fields = ('image_preview',)
    fields = ('key', 'label', 'image', 'image_preview', 'pos_x', 'pos_y', 'width', 'z_index', 'order')

    @admin.display(description='预览')
    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" style="max-width:80px;max-height:80px;" />'
        return '-'
    image_preview.allow_tags = True


@admin.register(HeroConfig)
class HeroConfigAdmin(admin.ModelAdmin):
    fields = (
        'title_line1', 'title_line2', 'title_size', 'title_font_family', 'title_gradient',
        'bg_type', 'bg_image', 'bg_video', 'bg_video_poster',
    )

    def has_add_permission(self, request):
        return not HeroConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
