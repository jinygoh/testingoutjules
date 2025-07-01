# This file defines the database models for the todo_app.
# Models are Python classes that represent tables in the database.
# Each attribute of the class represents a field in the table.
# Django's Object-Relational Mapper (ORM) uses these models to interact with the database.

from django.db import models

class TodoItem(models.Model):
    # Represents a single To-Do item.

    # title: A CharField to store the title of the to-do item.
    # max_length=200 ensures the title is not excessively long.
    title = models.CharField(max_length=200)

    # completed: A BooleanField to indicate whether the to-do item is completed or not.
    # default=False means new items are not completed by default.
    completed = models.BooleanField(default=False)

    def __str__(self):
        # Returns a string representation of the model instance,
        # which is useful for display in the Django admin interface and debugging.
        return self.title
