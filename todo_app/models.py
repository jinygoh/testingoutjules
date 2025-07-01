# todo_app/models.py
# This file defines the database models for the todo_app.
# Models are Python classes that represent tables in your database.
# Each attribute of the model class represents a database field.
# Django uses these models to interact with the database (CRUD operations)
# and to generate database schema changes (migrations).
# This file is crucial for defining the structure of your application's data.
# It will be used by other parts of Django, such as views (to fetch and manipulate data)
# and the admin interface (to manage data).

from django.db import models
from django.utils import timezone

class TodoItem(models.Model):
    """
    Represents a single To-Do item in the list.
    """
    # CharField is used for short strings.
    # `max_length` is required for CharField.
    title = models.CharField(
        max_length=100,
        help_text="The title of the to-do item." # help_text is useful for documentation and in the admin.
    )

    # TextField is used for longer blocks of text.
    # `blank=True` means the field is optional in forms.
    # `null=True` means the database can store a NULL value for this field (though for text fields, an empty string is often preferred).
    description = models.TextField(
        blank=True,
        null=True, # Allowing null for description if not provided
        help_text="A more detailed description of the to-do item."
    )

    # DateTimeField stores a date and time.
    # `default=timezone.now` sets the field to the current date and time when a new TodoItem is created.
    # It's often preferred over `auto_now_add=True` if you want to be able to override the value programmatically.
    # For this learning project, `auto_now_add=True` is simpler as it automatically sets the creation timestamp.
    created_at = models.DateTimeField(
        auto_now_add=True, # Automatically set the field to now when the object is first created.
        help_text="The date and time when the to-do item was created."
    )

    # BooleanField stores true/false values.
    # `default=False` means new to-do items will be marked as not completed by default.
    completed = models.BooleanField(
        default=False,
        help_text="Indicates whether the to-do item has been completed."
    )

    # DateTimeField for when the item was last updated.
    # `auto_now=True` automatically updates the field to now every time the object is saved.
    # This is useful for tracking modifications.
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="The date and time when the to-do item was last updated."
    )

    def __str__(self):
        """
        String representation of the TodoItem model.
        This is used in the Django admin interface and when an object is printed.
        Returns the title of the to-do item.
        """
        return self.title

    class Meta:
        # `ordering` specifies the default order for querysets of this model.
        # Here, items are ordered by their creation date, with the newest items first.
        # The '-' prefix indicates descending order.
        ordering = ['-created_at']
        # `verbose_name_plural` provides a human-readable plural name for the model in the admin.
        verbose_name_plural = "To-Do Items"
