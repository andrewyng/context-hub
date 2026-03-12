# Django 5.2 Admin Coding Guidelines

You are a Django admin coding expert. Help me configure Django 5.2 admin using `django-unfold`, which is a drop-in Tailwind-based theme that remains fully compatible with the standard `ModelAdmin` API.

You can find the official documentation here:
https://docs.djangoproject.com/en/5.2/ref/contrib/admin/
https://unfoldadmin.com/docs/

## Golden Rule: Use django-unfold's ModelAdmin, Not Django's Default

Always import `ModelAdmin` and inline classes from `unfold.admin`, not from `django.contrib.admin`. `unfold` must be listed before `django.contrib.admin` in `INSTALLED_APPS`.

- **Correct:** `from unfold.admin import ModelAdmin, TabularInline, StackedInline`
- **Correct:** `unfold` listed before `django.contrib.admin` in `INSTALLED_APPS`
- **Correct:** Use `format_html()` for any HTML output in list display methods
- **Correct:** Override `delete_model` and `delete_queryset` to respect soft deletion
- **Incorrect:** `from django.contrib.admin import ModelAdmin` when using unfold
- **Incorrect:** Raw HTML strings in display methods — use `format_html()` to prevent XSS
- **Incorrect:** `allow_tags = True` — removed in Django 4.0, use `format_html()` instead
- **Incorrect:** Placing `unfold` after `django.contrib.admin` in `INSTALLED_APPS`

**Installation:**

```bash
pip install django-unfold
```

## INSTALLED_APPS Configuration

```python
# settings.py
INSTALLED_APPS = [
    "unfold",
    "unfold.contrib.filters",   # optional: advanced filter widgets
    "unfold.contrib.forms",     # optional: styled form widgets
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # your apps...
]
```

## Basic ModelAdmin

```python
# courses/admin.py
from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Course


@admin.register(Course)
class CourseAdmin(ModelAdmin):
    list_display = ["title", "status", "instructor", "created_at"]
    list_filter = ["status"]
    search_fields = ["title", "instructor__email"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-created_at"]
    list_per_page = 25
```

## Custom User Admin

When using a custom `AbstractUser`, unregister the default and re-register with both `BaseUserAdmin` and unfold's `ModelAdmin`.

```python
# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from unfold.admin import ModelAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    list_display = ["email", "username", "is_staff", "is_active", "date_joined"]
    search_fields = ["email", "username"]
    readonly_fields = ["id", "date_joined", "last_login"]
    ordering = ["-date_joined"]

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Metadata", {"fields": ("id",)}),
    )
```

## Soft-Delete Integration

Override `get_queryset`, `delete_model`, and `delete_queryset` so admin respects soft deletion.

```python
from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from .models import Course


@admin.register(Course)
class CourseAdmin(ModelAdmin):
    list_display = ["title", "status", "is_active_display"]
    actions = ["restore_selected"]

    def get_queryset(self, request):
        # Show all objects including soft-deleted in admin
        return self.model.all_objects.all()

    def delete_model(self, request, obj):
        obj.delete()  # triggers soft delete

    def delete_queryset(self, request, queryset):
        queryset.delete()  # triggers SoftDeleteQuerySet.delete()

    @admin.display(boolean=True, description="Active")
    def is_active_display(self, obj):
        return not obj.is_deleted

    @admin.action(description="Restore selected items")
    def restore_selected(self, request, queryset):
        for obj in queryset:
            obj.restore()
        self.message_user(request, f"{queryset.count()} items restored.")
```

## Computed Columns in list_display

Use `@admin.display` decorator with `ordering` for database-sortable computed columns.

```python
from django.utils.html import format_html


@admin.register(Course)
class CourseAdmin(ModelAdmin):
    list_display = ["title", "instructor_email", "enrollment_count", "status_badge"]

    @admin.display(description="Instructor", ordering="instructor__email")
    def instructor_email(self, obj):
        return obj.instructor.email if obj.instructor else "—"

    @admin.display(description="Enrollments")
    def enrollment_count(self, obj):
        return obj.enrollments.count()

    @admin.display(description="Status")
    def status_badge(self, obj):
        colors = {
            "draft": "#6b7280",
            "published": "#16a34a",
            "archived": "#dc2626",
        }
        color = colors.get(obj.status, "#6b7280")
        return format_html(
            '<span style="color:{}; font-weight:600">{}</span>',
            color,
            obj.get_status_display(),
        )
```

## Inline Admin

Use `TabularInline` or `StackedInline` from `unfold.admin`.

```python
from unfold.admin import ModelAdmin, TabularInline
from .models import Course, Enrollment


class EnrollmentInline(TabularInline):
    model = Enrollment
    extra = 0
    fields = ["user", "enrolled_at", "status"]
    readonly_fields = ["enrolled_at"]
    can_delete = True


@admin.register(Course)
class CourseAdmin(ModelAdmin):
    inlines = [EnrollmentInline]
```

## Custom Actions

```python
from django.contrib import admin


@admin.register(Course)
class CourseAdmin(ModelAdmin):
    actions = ["publish_courses", "archive_courses"]

    @admin.action(description="Publish selected courses")
    def publish_courses(self, request, queryset):
        updated = queryset.update(status=Course.Status.PUBLISHED)
        self.message_user(request, f"{updated} course(s) published.")

    @admin.action(description="Archive selected courses")
    def archive_courses(self, request, queryset):
        updated = queryset.update(status=Course.Status.ARCHIVED)
        self.message_user(request, f"{updated} course(s) archived.")
```

## Unfold Sidebar Navigation (settings.py)

```python
# settings.py
UNFOLD = {
    "SITE_TITLE": "My App",
    "SITE_HEADER": "My App Admin",
    "SITE_URL": "/",
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Users",
                "items": [
                    {
                        "title": "Users",
                        "icon": "person",
                        "link": "/admin/accounts/user/",
                    },
                ],
            },
            {
                "title": "Courses",
                "items": [
                    {
                        "title": "All Courses",
                        "icon": "school",
                        "link": "/admin/courses/course/",
                    },
                ],
            },
        ],
    },
}
```

## Useful Links

- Django admin reference: https://docs.djangoproject.com/en/5.2/ref/contrib/admin/
- django-unfold documentation: https://unfoldadmin.com/docs/
- django-unfold GitHub: https://github.com/unfoldadmin/django-unfold
- Admin actions: https://docs.djangoproject.com/en/5.2/ref/contrib/admin/actions/
