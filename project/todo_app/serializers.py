# This file defines the serializers for the todo_app.
# Serializers in Django Rest Framework (DRF) are responsible for converting complex data types,
# like Django model instances, into native Python datatypes that can then be easily rendered
# into JSON, XML, or other content types. They also handle deserialization,
# validating incoming data and converting it back into complex types.

# This TodoItemSerializer will be used by the API views (in views.py) to handle
# the TodoItem model (defined in models.py).

from rest_framework import serializers
from .models import TodoItem


class TodoItemSerializer(serializers.ModelSerializer):
    # Meta class defines metadata for the serializer.
    class Meta:
        # model: Specifies the Django model that this serializer will work with.
        model = TodoItem
        # fields: Specifies the fields from the model that should be included in the serialization.
        # '__all__' means all fields from the TodoItem model will be used.
        # Alternatively, you can provide a list of field names, e.g., ['id', 'title', 'completed'].
        fields = "__all__"
