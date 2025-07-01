"""
URL configuration for learning_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# learning_project/urls.py
# This is the main URL configuration for the entire Django project.
# It routes URLs to the appropriate applications or directly to views.
# For our todo_app, we will include its dedicated urls.py file.

from django.contrib import admin
from django.urls import path, include # Import include

urlpatterns = [
    # Path for the Django admin interface.
    path("admin/", admin.site.urls),

    # Include the URL patterns from todo_app.urls.py.
    # All URLs defined in todo_app.urls will be prefixed with 'todos/'.
    # For example, if todo_app.urls has a path '' for listing items,
    # the full URL will be /todos/.
    # If it has 'create/', the full URL will be /todos/create/.
    path('todos/', include('todo_app.urls')),

    # It's good practice to have a root path for the project,
    # though for this example, we'll focus on the /todos/ path.
    # You could add a homepage here:
    # from django.views.generic import TemplateView
    # path('', TemplateView.as_view(template_name='homepage.html'), name='home'),
]
