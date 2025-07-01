# This file defines the views for the todo_app.
# Views in Django (and DRF) are Python functions or classes that take a web request
# and return a web response.
#
# In this file:
# - We will use Django Rest Framework's (DRF) ModelViewSet to quickly create
#   a full set of CRUD (Create, Read, Update, Delete) operations for the TodoItem model.
# - We will also create a simple Django view to render an HTML page for the frontend.

from rest_framework import viewsets
from .models import TodoItem
from .serializers import TodoItemSerializer
from django.shortcuts import render


# API Views:
class TodoItemViewSet(viewsets.ModelViewSet):
    # This ViewSet provides default CRUD operations for the TodoItem model.
    # It handles GET (list and retrieve), POST (create), PUT (update),
    # PATCH (partial update), and DELETE (destroy) requests.

    # queryset: Defines the initial set of objects that this viewset will operate on.
    # TodoItem.objects.all() retrieves all TodoItem instances from the database.
    queryset = TodoItem.objects.all()

    # serializer_class: Specifies the serializer class that DRF should use for
    # converting TodoItem model instances to and from JSON (or other content types).
    # This links to TodoItemSerializer defined in serializers.py.
    serializer_class = TodoItemSerializer


# Frontend View:
def index(request):
    # This view is responsible for rendering the main HTML page for the todo application.
    # It takes an HTTP request object.
    # render() is a Django shortcut to load a template, fill a context,
    # and return an HttpResponse object with that rendered text.
    # 'todo_app/index.html' is the path to the template file (relative to template directories).
    # We will create this HTML file in a later step.
    return render(request, "todo_app/index.html")
