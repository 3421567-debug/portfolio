from django.db import models


class About(models.Model):
    """个人简介 - 关于页面数据"""
    name = models.CharField('姓名', max_length=50, default='杨帆')
    avatar = models.ImageField('人物照片', upload_to='about/', blank=True, null=True)
    role = models.CharField('身份标签', max_length=200, default='摄影师 / 3D设计师 / AI视觉设计师')
    school = models.CharField('毕业院校', max_length=100, default='中央美术学院')
    bio = models.TextField('个人介绍', default='拥有多年视觉设计经验...')
    phone = models.CharField('联系电话', max_length=20, default='138-0000-0000')
    email = models.EmailField('电子邮箱', default='3421567@qq.com')
    location = models.CharField('所在地', max_length=100, default='中国 · 北京')
    zcool = models.URLField('站酷', blank=True)
    xiaohongshu = models.URLField('小红书', blank=True)
    douyin = models.URLField('抖音', blank=True)

    # 统计指标（后台可编辑，前端展示）
    stat_experience = models.CharField('经验年数', max_length=20, default='7+', help_text='例如: 7+')
    stat_projects = models.CharField('落地项目', max_length=20, default='20+', help_text='例如: 20+')
    stat_pages = models.CharField('年度A绩效', max_length=20, default='5+', help_text='例如: 5+')

    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '个人简介'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # 确保只有一条记录
        if not self.pk and About.objects.exists():
            raise ValueError('个人简介只能有一条记录，请在已有记录上修改')
        super().save(*args, **kwargs)


class WorkExperience(models.Model):
    """工作经历"""
    about = models.ForeignKey(About, on_delete=models.CASCADE, related_name='work_experiences')
    period = models.CharField('时间', max_length=50, help_text='例如: 2024 - 至今')
    title = models.CharField('职位', max_length=100)
    company = models.CharField('公司', max_length=100)
    description = models.TextField('描述', blank=True)
    order = models.IntegerField('排序', default=0)

    class Meta:
        verbose_name = '工作经历'
        verbose_name_plural = verbose_name
        ordering = ['-order']

    def __str__(self):
        return f'{self.period} {self.title}'


class ProjectExperience(models.Model):
    """实习经历"""
    about = models.ForeignKey(About, on_delete=models.CASCADE, related_name='project_experiences')
    period = models.CharField('时间', max_length=50, help_text='例如: 2025')
    title = models.CharField('职位', max_length=200)
    company = models.CharField('公司/组织', max_length=100, blank=True, default='')
    description = models.TextField('描述', blank=True)
    order = models.IntegerField('排序', default=0)

    class Meta:
        verbose_name = '实习经历'
        verbose_name_plural = verbose_name
        ordering = ['-order']

    def __str__(self):
        return f'{self.period} {self.title}'


class Award(models.Model):
    """获奖经历"""
    about = models.ForeignKey(About, on_delete=models.CASCADE, related_name='awards')
    year = models.CharField('年份', max_length=10, help_text='例如: 2025')
    name = models.CharField('奖项名称', max_length=200)
    organization = models.CharField('颁发机构', max_length=200, blank=True)
    order = models.IntegerField('排序', default=0)

    class Meta:
        verbose_name = '获奖经历'
        verbose_name_plural = verbose_name
        ordering = ['-order']

    def __str__(self):
        return f'{self.year} - {self.name}'


class WorkCategory(models.Model):
    """作品分类（摄影/3D/AI）"""
    name = models.CharField('分类名称', max_length=50, unique=True)
    slug = models.SlugField('URL标识', max_length=50, unique=True)
    order = models.IntegerField('排序', default=0)

    class Meta:
        verbose_name = '作品分类'
        verbose_name_plural = verbose_name
        ordering = ['order']

    def __str__(self):
        return self.name


class WorkImage(models.Model):
    """作品图片"""
    category = models.ForeignKey(WorkCategory, on_delete=models.CASCADE, related_name='images')
    title = models.CharField('作品标题', max_length=200, blank=True)
    image = models.ImageField('作品图片', upload_to='works/')
    display_mode = models.CharField(
        '展示比例',
        max_length=20,
        choices=[('horizontal', '横屏 16:9'), ('vertical', '竖屏 9:16')],
        default='horizontal',
    )
    uploaded_at = models.DateTimeField('上传时间', auto_now_add=True)
    order = models.IntegerField('排序', default=0)

    class Meta:
        verbose_name = '作品图片'
        verbose_name_plural = verbose_name
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title or f'作品 #{self.id}'


class HeroIcon(models.Model):
    """首页 Hero 区域的漂浮图标（数据库驱动，可在后台拖拽排版 / 替换图片）"""
    KEY_CHOICES = [
        ('camera', '相机'),
        ('finder', '访达'),
        ('folder', '文件夹'),
        ('terminal', '终端'),
    ]
    key = models.SlugField('标识', max_length=20, unique=True, choices=KEY_CHOICES)
    label = models.CharField('显示名', max_length=20, default='')
    image = models.ImageField('图标图片', upload_to='hero_icons/')
    pos_x = models.FloatField('水平位置(%)', default=50, help_text='相对 Hero 舞台左侧的百分比')
    pos_y = models.FloatField('垂直位置(%)', default=50, help_text='相对 Hero 舞台顶部的百分比')
    width = models.FloatField('宽度(px)', default=160)
    rotation = models.FloatField('旋转角度(deg)', default=0, help_text='顺时针旋转角度，PS 式操作框可调整')
    z_index = models.IntegerField('层级', default=2, help_text='2=在文字后，4=在文字前')
    order = models.IntegerField('排序', default=0)

    class Meta:
        verbose_name = '首页图标'
        verbose_name_plural = '首页图标'
        ordering = ['order']

    def __str__(self):
        return self.label or self.key


# ───────────────────────── 首页整体配置（单例） ─────────────────────────

DEFAULT_TITLE_FONT = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
DEFAULT_TITLE_GRADIENT = 'linear-gradient(90deg, #ffffff 0%, #e8eef8 20%, #a8c0e0 55%, #5a8ec8 100%)'
# 浅色 / 深色页面各自独立的标题渐变默认值
DEFAULT_TITLE_GRADIENT_LIGHT = 'linear-gradient(90deg, #93c5fd 0%, #60a5fa 30%, #3b82f6 70%, #2563eb 100%)'
DEFAULT_TITLE_GRADIENT_DARK = 'linear-gradient(90deg, #ffffff 0%, #e8eef8 20%, #a8c0e0 55%, #5a8ec8 100%)'

FONT_CHOICES = [
    (DEFAULT_TITLE_FONT, '无衬线（默认）'),
    ("'Noto Serif SC', 'Songti SC', serif", '衬线 Serif'),
    ("'SF Mono', 'JetBrains Mono', Consolas, monospace", '等宽 Mono'),
    ("'Quicksand', 'PingFang SC', sans-serif", '圆润 Quicksand'),
]

BG_TYPE_CHOICES = [
    ('none', '无'),
    ('image', '图片'),
    ('video', '视频'),
]


class HeroConfig(models.Model):
    """首页 Hero 区域整体配置：背景（图片/视频）+ 标题（文字/字号/字体/渐变）。单例。"""
    title_line1 = models.CharField('标题第一行', max_length=50, default='Design')
    title_line2 = models.CharField('标题第二行', max_length=50, default='Portfolio')
    title_size = models.IntegerField('标题最大字号(px)', default=168, help_text='响应式：实际会按屏幕宽度自动缩放')
    title_font_family = models.CharField('标题字体', max_length=200, default=DEFAULT_TITLE_FONT, choices=FONT_CHOICES)
    title_gradient = models.CharField('标题渐变色(兼容旧字段)', max_length=300, default=DEFAULT_TITLE_GRADIENT, blank=True,
                                      help_text='历史兼容字段，新逻辑按浅色/深色分别取用下方两个字段')
    title_gradient_light = models.CharField('浅色页面标题渐变', max_length=300, default=DEFAULT_TITLE_GRADIENT_LIGHT, blank=True)
    title_gradient_dark = models.CharField('深色页面标题渐变', max_length=300, default=DEFAULT_TITLE_GRADIENT_DARK, blank=True)

    bg_type = models.CharField('背景类型', max_length=10, choices=BG_TYPE_CHOICES, default='none')
    bg_image = models.ImageField('背景图片', upload_to='hero/', blank=True, null=True)
    bg_video = models.FileField('背景视频', upload_to='hero/', blank=True, null=True)
    bg_video_poster = models.ImageField('视频封面', upload_to='hero/', blank=True, null=True)

    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '首页配置'
        verbose_name_plural = '首页配置'

    def __str__(self):
        return '首页配置（单例）'

    def save(self, *args, **kwargs):
        # 强制单例：永远只有一条
        if not self.pk and HeroConfig.objects.exists():
            first = HeroConfig.objects.first()
            self.pk = first.pk
            self.id = first.id
        super().save(*args, **kwargs)

    @classmethod
    def get_active(cls):
        obj, _ = cls.objects.get_or_create(pk=1, defaults={
            'title_line1': 'Design',
            'title_line2': 'Portfolio',
            'title_size': 168,
            'title_font_family': DEFAULT_TITLE_FONT,
            'title_gradient': DEFAULT_TITLE_GRADIENT,
            'title_gradient_light': DEFAULT_TITLE_GRADIENT_LIGHT,
            'title_gradient_dark': DEFAULT_TITLE_GRADIENT_DARK,
            'bg_type': 'none',
        })
        return obj
