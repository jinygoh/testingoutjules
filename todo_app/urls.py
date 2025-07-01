# todo_app/urls.py
# This file defines the URL patterns specifically for the todo_app.
# URL patterns map web addresses (URLs) to views. When a user requests a URL,
# Django's URL dispatcher uses these patterns to find the appropriate view to handle the request.

# This file is typically included in the main project's urls.py (e.g., learning_project/urls.py).
# Using a separate urls.py for each app helps in keeping the project organized and modular.

# It will use:
# - views.py: The views defined in views.py are imported here and linked to URL paths.
# - Django's path function: To define individual URL patterns.

from django.urls import path
from . import views # Import views from the current directory (todo_app)

# `app_name` provides a namespace for these URLs.
# This allows you to refer to URLs uniquely, even if other apps have URLs with the same name.
# For example, you can use 'todo_app:todoitem_list' in templates or views to get this URL.
app_name = 'todo_app'

urlpatterns = [
    # Path for listing all TodoItems.
    # - The first argument is the URL pattern string. An empty string '' means the root of this app's URLs.
    # - The second argument is the view that will handle requests to this URL.
    #   `views.TodoItemListView.as_view()` is used because TodoItemListView is a class-based view.
    # - The third argument `name` gives a unique name to this URL pattern.
    #   This name is used for URL reversing (e.g., in templates or `reverse_lazy`).
    path('', views.TodoItemListView.as_view(), name='todoitem_list'),

    # Path for creating a new TodoItem.
    # URL: /create/
    path('create/', views.TodoItemCreateView.as_view(), name='todoitem_create'),

    # Path for updating an existing TodoItem.
    # - `<int:pk>` is a path converter. It captures an integer from the URL and passes it
    #   as a keyword argument `pk` (primary key) to the view.
    #   The UpdateView uses this `pk` to fetch the specific TodoItem to update.
    # URL example: /update/1/ (to update TodoItem with pk=1)
    path('update/<int:pk>/', views.TodoItemUpdateView.as_view(), name='todoitem_update'),

    # Path for deleting an existing TodoItem.
    # - Similar to update, `<int:pk>` captures the primary key of the item to be deleted.
    # URL example: /delete/1/ (to delete TodoItem with pk=1)
    path('delete/<int:pk>/', views.TodoItemDeleteView.as_view(), name='todoitem_delete'),

    # If we had a DetailView, it would look like this:
    # path('item/<int:pk>/', views.TodoItemDetailView.as_view(), name='todoitem_detail'),
]

# How these URLs will be accessed globally (assuming todo_app.urls is included under 'todos/'):
# - List: /todos/
# - Create: /todos/create/
# - Update item 1: /todos/update/1/
# - Delete item 1: /todos/delete/1/
