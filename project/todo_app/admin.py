# This file is used to register your Django models with the Django admin interface.
# When you register a model, Django provides a web-based interface
# for administrators to create, read, update, and delete instances of that model.

from django.contrib import admin
from .models import TodoItem # Import the TodoItem model

# To make the TodoItem model accessible in the admin interface,
# you would register it like this:
#
# admin.site.register(TodoItem)
#
# This line tells Django to create a default admin interface for the TodoItem model.
# You can customize the admin interface further by creating a ModelAdmin class.

# For this project, we will register the TodoItem model so it can be managed via /admin/.
admin.site.register(TodoItem)
