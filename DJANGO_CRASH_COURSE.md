# Django Crash Course - Learning Through Examples

Welcome to this Django crash course! This document will guide you through the fundamental concepts of the Django web framework, using the `learning_project` (specifically the `todo_app`) we've built as a practical example.

## Table of Contents

1.  [Introduction to Django](#1-introduction-to-django)
2.  [Projects and Apps](#2-projects-and-apps)
3.  [Models (M in MVT)](#3-models-m-in-mvt)
4.  [Migrations](#4-migrations)
5.  [Django Admin](#5-django-admin)
6.  [Views (V in MVT)](#6-views-v-in-mvt)
7.  [Templates (T in MVT)](#7-templates-t-in-mvt)
8.  [URLs (URL Routing)](#8-urls-url-routing)
9.  [Forms](#9-forms)
10. [Static Files (CSS, JavaScript, Images)](#10-static-files-css-javascript-images)
11. [MVT (Model-View-Template) Architecture](#11-mvt-model-view-template-architecture)
12. [Next Steps](#12-next-steps)

---

## 1. Introduction to Django

Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design. Built by experienced developers, it takes care of much of the hassle of web development, so you can focus on writing your application without needing to reinvent the wheel. It’s free and open source.

**Key Features:**

*   **Batteries Included:** Comes with many built-in features like an ORM (Object-Relational Mapper), admin interface, authentication system, etc.
*   **Scalable:** Designed to handle high traffic and large amounts of data.
*   **Secure:** Helps developers avoid common security mistakes (XSS, CSRF, SQL injection).
*   **Versatile:** Can be used to build any type of web application, from simple sites to complex platforms.

---

## 2. Projects and Apps

In Django, the distinction between "projects" and "apps" is important:

*   **Project:** A Django project is a collection of settings and apps for a particular website. Think of it as the entire web application.
    *   **Example:** Our `learning_project` is the Django project.
    *   When you run `django-admin startproject learning_project .`, Django creates a directory structure for your project:
        ```
        learning_project/
            manage.py
            learning_project/  <-- Project configuration directory
                __init__.py
                settings.py    <-- Project settings
                urls.py        <-- Project-level URL declarations
                asgi.py
                wsgi.py
        ```
    *   `manage.py`: A command-line utility for interacting with your project (e.g., running the development server, creating migrations).
    *   `learning_project/settings.py`: Contains all the configuration for your project, like database settings, installed apps, middleware, static files paths, etc.
    *   `learning_project/urls.py`: The main URL router for your project. It includes URL patterns for different apps.

*   **App:** A Django app is a self-contained module that provides a specific piece of functionality. An app is designed to be reusable across different projects. A single project can be composed of multiple apps.
    *   **Example:** Our `todo_app` is a Django app. It handles all the to-do list functionality.
    *   You create an app using `python manage.py startapp todo_app`. This creates a directory structure for the app:
        ```
        todo_app/
            __init__.py
            admin.py       <-- Admin interface configuration for this app
            apps.py        <-- App configuration
            migrations/    <-- Database migration files
                __init__.py
            models.py      <-- Database models for this app
            tests.py       <-- Tests for this app
            views.py       <-- Views (request handlers) for this app
            urls.py        <-- (Optional, but good practice) URL declarations for this app
            templates/     <-- (By convention) HTML templates for this app
            static/        <-- (By convention) Static files (CSS, JS) for this app
        ```
    *   To use an app in a project, you must add it to the `INSTALLED_APPS` list in the project's `settings.py` file.
        *   **Reference:** See `learning_project/settings.py`:
            ```python
            INSTALLED_APPS = [
                # ... other Django apps
                'todo_app', # Our application
            ]
            ```

---

## 3. Models (M in MVT)

Models are Python classes that define the structure of your application's data. Each model maps to a single database table.

*   Each attribute of the model class represents a database field (column).
*   Django uses models to interact with the database (e.g., create, retrieve, update, delete records) through its ORM.

**Example: `TodoItem` Model**

*   **File:** `todo_app/models.py`
    ```python
    # todo_app/models.py
    # This file defines the database models for the todo_app.
    # Models are Python classes that represent tables in your database.

    from django.db import models
    from django.utils import timezone

    class TodoItem(models.Model):
        # CharField is used for short strings.
        title = models.CharField(max_length=100, help_text="The title of the to-do item.")
        # TextField is used for longer blocks of text.
        description = models.TextField(blank=True, null=True, help_text="A more detailed description of the to-do item.")
        # DateTimeField stores a date and time.
        # auto_now_add=True automatically sets the field to now when the object is first created.
        created_at = models.DateTimeField(auto_now_add=True, help_text="The date and time when the to-do item was created.")
        # BooleanField stores true/false values.
        completed = models.BooleanField(default=False, help_text="Indicates whether the to-do item has been completed.")
        # auto_now=True automatically updates the field to now every time the object is saved.
        updated_at = models.DateTimeField(auto_now=True, help_text="The date and time when the to-do item was last updated.")

        def __str__(self):
            # String representation used in admin and when printing the object.
            return self.title

        class Meta:
            # Default ordering for querysets. '-' means descending.
            ordering = ['-created_at']
            verbose_name_plural = "To-Do Items"
    ```

**Common Field Types:**

*   `CharField`: For strings (requires `max_length`).
*   `TextField`: For large text blocks.
*   `IntegerField`, `FloatField`: For numbers.
*   `BooleanField`: For true/false.
*   `DateField`, `DateTimeField`: For dates and times. `auto_now_add=True` sets the value to the current time when the object is first created. `auto_now=True` updates the value to the current time every time the object is saved.
*   `ForeignKey`: To define a many-to-one relationship (e.g., a comment belonging to a post).
*   `ManyToManyField`: To define a many-to-many relationship (e.g., tags on a blog post).
*   `OneToOneField`: To define a one-to-one relationship (e.g., a user profile linked to a user).

---

## 4. Migrations

Migrations are Django's way of propagating changes you make to your models (adding a field, deleting a model, etc.) into your database schema.

*   When you change your `models.py` file, you need to tell Django to create a migration file.
*   This migration file contains Python code that describes the changes to be applied to the database.
*   You then apply this migration to update your database schema.

**Workflow:**

1.  **Modify your models:** E.g., add a new field to `TodoItem` in `todo_app/models.py`.
2.  **Create migrations:**
    ```bash
    python manage.py makemigrations <app_name>
    ```
    *   **Example:** `python manage.py makemigrations todo_app`
    *   This creates a new file in `todo_app/migrations/` (e.g., `0001_initial.py` for the first migration, `0002_added_new_field.py` for subsequent ones).
    *   **Reference:** The `todo_app/migrations/0001_initial.py` file was created for our `TodoItem` model.

3.  **Apply migrations:**
    ```bash
    python manage.py migrate
    ```
    *   This command runs all unapplied migrations, updating your database schema to match your models.

**Why migrations?**

*   **Version control for your database schema:** Migrations are stored in your project and can be version-controlled with Git.
*   **Collaboration:** Allows multiple developers to work on the database schema safely.
*   **Deployment:** Simplifies database updates during deployment.

---

## 5. Django Admin

Django provides a powerful, ready-to-use administrative interface. It reads metadata from your models to provide a quick, model-centric interface where trusted users can manage content on your site.

*   To access the admin, you first need to create a superuser:
    ```bash
    python manage.py createsuperuser
    ```
    (Follow the prompts to set a username, email, and password.)
*   Then, run the development server (`python manage.py runserver`) and navigate to `/admin/` in your browser.

**Registering Models with the Admin:**

*   To make your app's models manageable in the admin, you need to register them in the app's `admin.py` file.
*   **File:** `todo_app/admin.py`
    ```python
    # todo_app/admin.py
    # This file is used to configure how your models are displayed and managed
    # in the Django admin interface.

    from django.contrib import admin
    from .models import TodoItem # Import the TodoItem model

    # ModelAdmin classes are used to customize the admin interface for a model.
    class TodoItemAdmin(admin.ModelAdmin):
        # list_display controls which fields are shown in the list view.
        list_display = ('title', 'completed', 'created_at', 'updated_at')
        # list_filter adds a sidebar for filtering by these fields.
        list_filter = ('completed', 'created_at')
        # search_fields enables a search box.
        search_fields = ('title', 'description')
        # readonly_fields makes fields non-editable in the admin form.
        readonly_fields = ('created_at', 'updated_at')
        # fieldsets organizes the edit form into sections.
        fieldsets = (
            (None, {'fields': ('title', 'description')}),
            ('Status', {'fields': ('completed',), 'classes': ('collapse',)}),
            ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)})
        )

    # Register the TodoItem model with the custom TodoItemAdmin class.
    admin.site.register(TodoItem, TodoItemAdmin)
    ```
*   By creating a `ModelAdmin` subclass (like `TodoItemAdmin`), you can customize how the model appears and behaves in the admin (e.g., fields displayed, filters, search capabilities).

---

## 6. Views (V in MVT)

Views are the request handlers in Django. They take an HTTP request and return an HTTP response. The response can be HTML, a redirect, an error, JSON, etc.

*   Views typically:
    1.  Receive a request.
    2.  Process the request (e.g., interact with models to fetch/save data, perform calculations).
    3.  Render a template with context data, or return a redirect.
*   **File:** `todo_app/views.py`

Django offers two main types of views:

*   **Function-Based Views (FBVs):** Simple Python functions.
*   **Class-Based Views (CBVs):** Python classes that inherit from Django's generic view classes. CBVs are particularly useful for common patterns like displaying lists of objects, or handling form submissions for creating/updating objects.

Our `todo_app` uses Class-Based Views for CRUD (Create, Retrieve, Update, Delete) operations:

```python
# todo_app/views.py
# This file defines the views for the todo_app.

from django.urls import reverse_lazy
from django.views.generic import (
    ListView, CreateView, UpdateView, DeleteView
)
from .models import TodoItem

# ListView for TodoItems
class TodoItemListView(ListView):
    model = TodoItem # Specifies the model
    template_name = 'todo_app/todoitem_list.html' # Template to render
    context_object_name = 'todo_items' # Variable name in template for the list of items

# CreateView for TodoItems
class TodoItemCreateView(CreateView):
    model = TodoItem
    template_name = 'todo_app/todoitem_form.html' # Template with the form
    fields = ['title', 'description', 'completed'] # Fields to include in the form
    success_url = reverse_lazy('todo_app:todoitem_list') # URL to redirect after success

# UpdateView for TodoItems
class TodoItemUpdateView(UpdateView):
    model = TodoItem
    template_name = 'todo_app/todoitem_form.html'
    fields = ['title', 'description', 'completed']
    success_url = reverse_lazy('todo_app:todoitem_list')

# DeleteView for TodoItems
class TodoItemDeleteView(DeleteView):
    model = TodoItem
    template_name = 'todo_app/todoitem_confirm_delete.html' # Confirmation page
    success_url = reverse_lazy('todo_app:todoitem_list')
```

**Key attributes for generic CBVs:**

*   `model`: The model this view operates on.
*   `template_name`: The path to the HTML template to be rendered.
*   `context_object_name`: The name of the variable passed to the template containing the object(s).
*   `fields`: For `CreateView` and `UpdateView`, specifies which model fields to include in the form.
*   `success_url`: The URL to redirect to after a successful form submission (for `CreateView`, `UpdateView`, `DeleteView`). `reverse_lazy` is used to look up URLs by their name, preventing circular imports at startup.

---

## 7. Templates (T in MVT)

Templates are responsible for the presentation layer. They are typically HTML files with special Django-specific syntax (Django Template Language - DTL) to display dynamic data.

*   **Directory:** By convention, app-specific templates are stored in `your_app/templates/your_app/`.
    *   **Example:** `todo_app/templates/todo_app/`
*   Django's template engine processes these files, replacing template tags and variables with actual values, and returns an HTML response.

**Django Template Language (DTL) Basics:**

*   **Variables:** `{{ variable_name }}`
    *   Replaced with the value of the variable from the context passed by the view.
    *   **Example (in `todoitem_list.html`):** `{{ item.title }}` displays the title of a todo item.
*   **Tags:** `{% tag_name %}`
    *   Perform logic, like loops or conditional statements.
    *   **Examples:**
        *   `{% for item in todo_items %}` ... `{% endfor %}` (Looping)
        *   `{% if item.completed %}` ... `{% else %}` ... `{% endif %}` (Conditionals)
        *   `{% extends "todo_app/base.html" %}` (Template inheritance)
        *   `{% block content %}` ... `{% endblock content %}` (Defines a block that can be overridden by child templates)
        *   `{% url 'todo_app:todoitem_create' %}` (URL reversing - generates a URL based on its name)
        *   `{% csrf_token %}` (Security tag for forms)
        *   `{% load static %}` (To use the `static` tag for static files)
*   **Filters:** `{{ variable|filter_name:argument }}`
    *   Modify the display of variables.
    *   **Examples:**
        *   `{{ item.created_at|date:"Y-m-d H:i" }}` (Formats a date)
        *   `{{ item.description|linebreaksbr }}` (Converts newlines to `<br>` tags)
        *   `{{ item.description|truncatewords:30 }}` (Truncates text)

**Template Inheritance:**

*   A powerful feature that allows you to define a base template with common page elements (header, footer, navigation) and then have child templates extend it and override specific blocks.
*   **Base Template:** `todo_app/templates/todo_app/base.html`
    ```html
    <!-- todo_app/templates/todo_app/base.html -->
    <!DOCTYPE html>
    <html>
    <head>
        <title>{% block title %}My Todo App{% endblock title %}</title>
        <link rel="stylesheet" href="{% static 'todo_app/style.css' %}">
    </head>
    <body>
        <header>...</header>
        <main>
            {% block content %}{% endblock content %}
        </main>
        <footer>...</footer>
    </body>
    </html>
    ```
*   **Child Template:** `todo_app/templates/todo_app/todoitem_list.html`
    ```html
    <!-- todo_app/templates/todo_app/todoitem_list.html -->
    {% extends "todo_app/base.html" %}

    {% block title %}Todo List - {{ block.super }}{% endblock title %}

    {% block content %}
        <h2>Current Todo Items</h2>
        {% if todo_items %}
            <ul>
                {% for item in todo_items %}
                    <li>{{ item.title }}
                        <!-- Links to update and delete -->
                        <a href="{% url 'todo_app:todoitem_update' pk=item.pk %}">Edit</a>
                        <a href="{% url 'todo_app:todoitem_delete' pk=item.pk %}">Delete</a>
                    </li>
                {% endfor %}
            </ul>
        {% else %}
            <p>No to-do items yet.</p>
        {% endif %}
        <a href="{% url 'todo_app:todoitem_create' %}">Add New Todo Item</a>
    {% endblock content %}
    ```
    *   `{% extends "..." %}` must be the first tag.
    *   `{% block ... %}` defines sections that the child template can fill. `{{ block.super }}` can be used to include content from the parent block.

---

## 8. URLs (URL Routing)

URL routing maps URLs (web addresses) to views. When a user requests a URL, Django's URL dispatcher uses these patterns to find the appropriate view.

*   **Project URLs:** The main `urls.py` for the project.
    *   **File:** `learning_project/urls.py`
        ```python
        # learning_project/urls.py
        from django.contrib import admin
        from django.urls import path, include # Import include

        urlpatterns = [
            path('admin/', admin.site.urls),
            # Includes URLs from todo_app, prefixed with 'todos/'
            path('todos/', include('todo_app.urls')),
        ]
        ```
    *   The `include()` function allows referencing other URLconfs (URL configurations). This makes it easy to plug in app-specific URLs.

*   **App URLs:** Each app can have its own `urls.py` file to define its URL patterns.
    *   **File:** `todo_app/urls.py`
        ```python
        # todo_app/urls.py
        from django.urls import path
        from . import views # Import views from the current app

        app_name = 'todo_app' # Namespacing URLs

        urlpatterns = [
            # Example: http://localhost:8000/todos/
            path('', views.TodoItemListView.as_view(), name='todoitem_list'),
            # Example: http://localhost:8000/todos/create/
            path('create/', views.TodoItemCreateView.as_view(), name='todoitem_create'),
            # Example: http://localhost:8000/todos/update/1/
            path('update/<int:pk>/', views.TodoItemUpdateView.as_view(), name='todoitem_update'),
            # Example: http://localhost:8000/todos/delete/1/
            path('delete/<int:pk>/', views.TodoItemDeleteView.as_view(), name='todoitem_delete'),
        ]
        ```
    *   `path(route, view, name)`:
        *   `route`: A string defining the URL pattern. It can include converters like `<int:pk>` to capture parts of the URL and pass them as arguments to the view (e.g., `pk` for primary key).
        *   `view`: The view function or class-based view (`.as_view()`) to handle the request.
        *   `name`: A unique name for this URL pattern. This name is used for **URL reversing** (e.g., `{% url 'todo_app:todoitem_list' %}` in templates or `reverse_lazy('todo_app:todoitem_list')` in views). Using named URLs makes your application more maintainable, as you can change the URL structure without updating all references to it.
    *   `app_name`: Defines a namespace for the app's URLs. This is crucial when you have multiple apps that might use the same URL name (e.g., 'list'). You refer to namespaced URLs as `'app_name:url_name'`.

---

## 9. Forms

Django provides a powerful form handling framework that simplifies creating HTML forms, validating data, and processing submissions.

*   **Automatic Form Generation (with CBVs):**
    *   For `CreateView` and `UpdateView`, Django can automatically generate a form based on the `model` and `fields` attributes.
    *   **Reference (in `todo_app/views.py`):**
        ```python
        class TodoItemCreateView(CreateView):
            model = TodoItem
            fields = ['title', 'description', 'completed'] # Django creates a form with these fields
            template_name = 'todo_app/todoitem_form.html'
            # ...
        ```
    *   This automatically creates a `ModelForm` in the background.

*   **Rendering Forms in Templates:**
    *   The form object is passed to the template (usually as `form`).
    *   You can render it in various ways:
        *   `{{ form.as_p }}`: Renders each field wrapped in `<p>` tags.
        *   `{{ form.as_ul }}`: Renders each field as an `<li>`.
        *   `{{ form.as_table }}`: Renders each field as a `<tr>`.
        *   Manual field rendering for more control:
            ```html
            <form method="post">
                {% csrf_token %} <!-- Essential for security -->
                <div>
                    {{ form.title.label_tag }}
                    {{ form.title }}
                    {% if form.title.errors %}<div class="errors">{{ form.title.errors }}</div>{% endif %}
                </div>
                <!-- ... other fields ... -->
                <button type="submit">Save</button>
            </form>
            ```
    *   **Reference:** `todo_app/templates/todo_app/todoitem_form.html` uses `{{ form.as_p }}`.
        ```html
        <!-- todo_app/templates/todo_app/todoitem_form.html -->
        <form method="post" class="todo-form">
            {% csrf_token %}
            {{ form.as_p }}
            <button type="submit">Save</button>
        </form>
        ```

*   **CSRF Protection:**
    *   `{% csrf_token %}` template tag is crucial. It protects against Cross-Site Request Forgeries by adding a hidden input field with a unique token to POST forms. Django checks this token on submission.

*   **Custom Forms (Optional for this project, but good to know):**
    *   For more complex scenarios, you can define custom form classes by inheriting from `django.forms.Form` or `django.forms.ModelForm`.
    *   This gives you fine-grained control over validation, widgets, and layout.
    *   You would typically create a `forms.py` file in your app for this.

---

## 10. Static Files (CSS, JavaScript, Images)

Static files are assets like CSS, JavaScript, and images that are not dynamically generated by the server.

*   **Configuration (`settings.py`):**
    *   Ensure `django.contrib.staticfiles` is in `INSTALLED_APPS`.
    *   `STATIC_URL`: The base URL to serve static files from (e.g., `/static/`).
        ```python
        # learning_project/settings.py
        STATIC_URL = 'static/'
        # Optional: For global static files not tied to an app
        # STATICFILES_DIRS = [BASE_DIR / "static"]
        ```

*   **Organizing Static Files:**
    *   Place app-specific static files in a `static` directory inside your app.
    *   Within this `static` directory, create another directory named after your app to namespace the files.
    *   **Example:** `todo_app/static/todo_app/style.css`

*   **Using Static Files in Templates:**
    1.  Load the `staticfiles` template tags at the top of your template: `{% load static %}`.
    2.  Use the `static` template tag to generate the URL for a static file:
        ```html
        <!-- todo_app/templates/todo_app/base.html -->
        {% load static %}
        <link rel="stylesheet" href="{% static 'todo_app/style.css' %}">
        ```
        This will render as `<link rel="stylesheet" href="/static/todo_app/style.css">` (assuming `STATIC_URL` is `'/static/'`).

*   **Development vs. Production:**
    *   **Development:** Django's development server (`runserver`) automatically serves static files found in app `static/` directories and any directories listed in `STATICFILES_DIRS`.
    *   **Production:** `runserver` is not for production. You must run `python manage.py collectstatic`. This command gathers all static files from your apps and `STATICFILES_DIRS` into a single directory (defined by `STATIC_ROOT` in `settings.py`) that can then be served by a dedicated web server like Nginx or Apache.

---

## 11. MVT (Model-View-Template) Architecture

Django follows the MVT (Model-View-Template) architectural pattern, which is a variation of the more common MVC (Model-View-Controller).

*   **Model (M):** The data layer. Responsible for managing the application's data and interacting with the database.
    *   **Our example:** `todo_app/models.py` (the `TodoItem` class).

*   **View (V):** The logic layer. Receives HTTP requests, processes them (e.g., interacts with models, performs business logic), and returns an HTTP response, often by rendering a template.
    *   In Django, this is what is traditionally called a "Controller" in MVC.
    *   **Our example:** `todo_app/views.py` (e.g., `TodoItemListView`, `TodoItemCreateView`).

*   **Template (T):** The presentation layer. Defines how data is displayed to the user, typically as HTML.
    *   In Django, this is what is traditionally called a "View" in MVC.
    *   **Our example:** Files in `todo_app/templates/todo_app/` (e.g., `todoitem_list.html`).

**How it works together:**

1.  A user requests a URL.
2.  Django's **URL dispatcher** (defined in `urls.py`) matches the URL to a **View**.
3.  The **View** processes the request. It might interact with **Models** to fetch or save data.
4.  The **View** then typically selects a **Template** and passes it context data (the data it fetched or processed).
5.  The **Template** engine renders the template with the context data, producing HTML.
6.  The **View** returns this HTML as an HTTP response to the user's browser.

This separation of concerns makes the application more organized, easier to maintain, and scalable.

---

## 12. Next Steps

This crash course covered the basics of Django using our `todo_app`. To continue your learning journey and become proficient for an entry-level full-stack role, consider exploring these topics:

*   **Django Forms in Depth:** Custom form classes, validation, widgets.
*   **User Authentication and Authorization:** Django's built-in system (`django.contrib.auth`), user registration, login, logout, permissions.
*   **Class-Based Views (CBVs) in Detail:** More generic views (e.g., `DetailView`), mixins, customization.
*   **Advanced Querying:** Complex database lookups using the Django ORM (`Q objects`, aggregation, annotation).
*   **Database Relationships:** `ForeignKey`, `ManyToManyField`, `OneToOneField` in more detail.
*   **Testing:** Writing unit and integration tests using Django's testing framework (`unittest` or `pytest`).
*   **Django REST framework (DRF):** For building Web APIs. Essential for many full-stack roles.
*   **Deployment:** Deploying Django applications to servers (e.g., Heroku, AWS, DigitalOcean) using Gunicorn/uWSGI and Nginx/Apache.
*   **Working with settings for different environments** (development, staging, production).
*   **Middleware:** Understanding and writing custom middleware.
*   **Signals:** For decoupled communication between different parts of your application.
*   **Caching:** Improving performance with Django's caching framework.
*   **Internationalization and Localization:** Building multilingual applications.
*   **Security Best Practices:** Dive deeper into Django's security features.
*   **Frontend Integration:** How Django works with JavaScript frameworks like React, Vue, or Angular (often via DRF).

**Resources:**

*   **Official Django Documentation:** (https://docs.djangoproject.com/) - The best resource.
*   **MDN Django Tutorial:** (https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django)
*   **Django Girls Tutorial:** (https://tutorial.djangogirls.org/) - Great for beginners.
*   **Books:** "Two Scoops of Django" (highly recommended for best practices).

Keep practicing by building more projects! Good luck!
