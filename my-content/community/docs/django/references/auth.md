# Django 5.2 Auth & Permissions Coding Guidelines

You are a Django authentication expert. Help me write Django 5.2 authentication and authorization code including login/logout flows, decorators, mixins, model permissions, and group-based roles.

You can find the official documentation here:
https://docs.djangoproject.com/en/5.2/topics/auth/

## Golden Rule: is_authenticated is a Property, Not a Method

Never call `request.user.is_authenticated()` with parentheses. It is a boolean property since Django 1.10. Always use `create_user()` or `set_password()` — never assign raw passwords directly.

- **Correct:** `if request.user.is_authenticated:`
- **Correct:** `User.objects.create_user(username, email, password)`
- **Correct:** `user.set_password("newpassword"); user.save()`
- **Correct:** `from django.contrib.auth.decorators import login_required`
- **Incorrect:** `if request.user.is_authenticated():` — always evaluates to True (method is truthy)
- **Incorrect:** `User.objects.create(password="plaintext")` — stores raw string, login will never work
- **Incorrect:** `User.objects.filter(password="somepassword")` — passwords are hashed, never query by raw value

## Creating and Managing Users

```python
from django.contrib.auth import get_user_model

User = get_user_model()

# Create regular user
user = User.objects.create_user(
    username="giancarmine",
    email="g@example.com",
    password="securepassword123",
)

# Create superuser
superuser = User.objects.create_superuser(
    username="admin",
    email="admin@example.com",
    password="adminpassword",
)

# Change password
user.set_password("newpassword456")
user.save()

# Check password
is_valid = user.check_password("securepassword123")  # True or False
```

Always use `get_user_model()` instead of importing `User` directly — it respects `AUTH_USER_MODEL`.

## Login and Logout

```python
# views.py
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import redirect


def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("dashboard")
        else:
            # Return error — invalid credentials
            ...
    ...


def logout_view(request):
    logout(request)
    return redirect("home")
```

## login_required: Decorator, Middleware, and Mixin

### Middleware (Django 5.0+) — recommended when most views require login

```python
# settings.py
MIDDLEWARE = [
    ...
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.auth.middleware.LoginRequiredMiddleware",
]

LOGIN_URL = "/accounts/login/"
LOGIN_REDIRECT_URL = "/dashboard/"
```

Opt out individual public views with `@login_not_required`:

```python
from django.contrib.auth.decorators import login_not_required


@login_not_required
def public_landing(request):
    ...
```

### Decorator — for function-based views

```python
from django.contrib.auth.decorators import login_required


@login_required
def dashboard(request):
    ...

# Custom redirect
@login_required(login_url="/custom-login/")
def protected_view(request):
    ...
```

### Mixin — for class-based views

```python
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView


class CourseListView(LoginRequiredMixin, ListView):
    model = Course
    login_url = "/accounts/login/"
    redirect_field_name = "next"
```

## Object-Level Permissions

Django's built-in system is model-level. For row-level (object-level) ownership checks, use explicit view logic or `UserPassesTestMixin`.

```python
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404


@login_required
def edit_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    if course.instructor != request.user:
        raise PermissionDenied
    ...
```

### UserPassesTestMixin for class-based views

```python
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import UpdateView


class CourseEditView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Course

    def test_func(self):
        course = self.get_object()
        return course.instructor == self.request.user
```

## Model-Level Permissions

Django auto-creates `add_<model>`, `change_<model>`, `delete_<model>`, `view_<model>` for every model.

```python
# Check in views
if not request.user.has_perm("courses.change_course"):
    raise PermissionDenied

# Check multiple permissions
if not request.user.has_perms(["courses.add_course", "courses.change_course"]):
    raise PermissionDenied
```

```django
{# Check in templates #}
{% if perms.courses.change_course %}
    <a href="{% url 'course-edit' course.pk %}">Edit</a>
{% endif %}
```

### Custom Permissions on Models

```python
class Course(BaseModel):
    class Meta:
        permissions = [
            ("publish_course", "Can publish course"),
            ("feature_course", "Can mark course as featured"),
        ]
```

Assign to a user:

```python
from django.contrib.auth.models import Permission

permission = Permission.objects.get(codename="publish_course")
user.user_permissions.add(permission)

# Check
user.has_perm("courses.publish_course")  # True
```

## Group-Based Role System

```python
from django.contrib.auth.models import Group, Permission


# Create groups (typically in a data migration or management command)
instructor_group, _ = Group.objects.get_or_create(name="Instructor")
student_group, _ = Group.objects.get_or_create(name="Student")

# Assign permissions to group
publish_perm = Permission.objects.get(codename="publish_course")
instructor_group.permissions.add(publish_perm)

# Add user to group
user.groups.add(instructor_group)

# Remove user from group
user.groups.remove(instructor_group)

# Check group membership
user.groups.filter(name="Instructor").exists()  # True or False
```

### Role Check Helper

```python
# utils/auth.py
def is_instructor(user):
    return user.groups.filter(name="Instructor").exists()

def is_student(user):
    return user.groups.filter(name="Student").exists()
```

```python
# In views
from utils.auth import is_instructor
from django.contrib.auth.decorators import user_passes_test

@user_passes_test(is_instructor)
def instructor_dashboard(request):
    ...
```

## Permission Required Decorator and Mixin

```python
from django.contrib.auth.decorators import permission_required


@permission_required("courses.publish_course", raise_exception=True)
def publish_course(request, course_id):
    ...
```

```python
from django.contrib.auth.mixins import PermissionRequiredMixin


class PublishCourseView(LoginRequiredMixin, PermissionRequiredMixin, UpdateView):
    permission_required = "courses.publish_course"
    raise_exception = True
```

## Session Security Settings (Production)

```python
# settings.py
SESSION_COOKIE_SECURE = True       # HTTPS only
SESSION_COOKIE_HTTPONLY = True     # No JavaScript access
SESSION_COOKIE_SAMESITE = "Lax"   # CSRF protection
SESSION_COOKIE_AGE = 60 * 60 * 24 * 30  # 30 days
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

CSRF_COOKIE_SECURE = True
```

## Password Validation

```python
# settings.py
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
```

## Useful Links

- Auth documentation: https://docs.djangoproject.com/en/5.2/topics/auth/
- Permissions: https://docs.djangoproject.com/en/5.2/topics/auth/default/#permissions-and-authorization
- LoginRequiredMiddleware: https://docs.djangoproject.com/en/5.2/ref/middleware/#django.contrib.auth.middleware.LoginRequiredMiddleware
- Mixins: https://docs.djangoproject.com/en/5.2/topics/auth/default/#the-loginrequiredmixin-mixin
- Password management: https://docs.djangoproject.com/en/5.2/topics/auth/passwords/
