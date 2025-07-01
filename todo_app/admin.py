# todo_app/admin.py
# This file is used to configure how your models are displayed and managed
# in the Django admin interface. The Django admin is a powerful, auto-generated
# user interface for managing your site's content.

# To make a model visible in the admin, you need to register it here.
# You can also customize how the model is presented in the admin,
# for example, which fields are displayed in the list view,
# which fields are filterable, and how the edit form looks.

from django.contrib import admin
from .models import TodoItem # Import the TodoItem model from models.py

# ModelAdmin classes are used to customize the admin interface for a model.
class TodoItemAdmin(admin.ModelAdmin):
    """
    Customizes the admin interface for the TodoItem model.
    """
    # `list_display` controls which fields are shown in the change list page of the admin.
    list_display = ('title', 'completed', 'created_at', 'updated_at')

    # `list_filter` adds a sidebar that allows filtering the change list by these fields.
    list_filter = ('completed', 'created_at', 'updated_at')

    # `search_fields` enables a search box on the admin change list page.
    # It will search the specified fields.
    search_fields = ('title', 'description')

    # `date_hierarchy` adds hierarchical navigation by date to the change list page.
    # This is useful for models with date/datetime fields.
    date_hierarchy = 'created_at'

    # `ordering` specifies how objects are ordered in the admin views.
    ordering = ('-created_at',)

    # `fields` customizes the layout of the add/change form.
    # If not specified, Django displays all fields in a default order.
    # You can group fields using tuples within the list.
    # fields = (('title', 'completed'), 'description') # Example of field grouping

    # `fieldsets` provides a more structured way to organize the add/change form,
    # allowing you to group fields under named sections.
    fieldsets = (
        (None, { # The first element of the tuple is the title of the fieldset (None for no title)
            'fields': ('title', 'description') # Fields in this group
        }),
        ('Status', { # A fieldset named 'Status'
            'fields': ('completed',), # Fields in this group
            'classes': ('collapse',) # 'collapse' makes the fieldset initially collapsed
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
            # Note: 'created_at' and 'updated_at' are often made read-only if auto-set
        })
    )

    # `readonly_fields` specifies fields that should be displayed as read-only in the admin form.
    # This is useful for fields that are set automatically, like `created_at` and `updated_at`.
    readonly_fields = ('created_at', 'updated_at')

# Register the TodoItem model with the custom TodoItemAdmin class.
# This makes TodoItem manageable through the Django admin interface.
admin.site.register(TodoItem, TodoItemAdmin)

# If you didn't need any customization, you could simply do:
# admin.site.register(TodoItem)
# But using a ModelAdmin class gives you much more control.
