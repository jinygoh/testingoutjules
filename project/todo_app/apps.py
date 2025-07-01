# This file is used to configure the application itself.
# Django uses this configuration to understand how the app should behave,
# its name, and other app-specific settings.

from django.apps import AppConfig


class TodoAppConfig(AppConfig):
    # default_auto_field: Specifies the type of primary key to use for models
    # that don't explicitly define one. BigAutoField is a 64-bit integer.
    default_auto_field = "django.db.models.BigAutoField"
    # name: The full Python path to the application (e.g., 'my_project.my_app').
    # Here, it's simply 'todo_app' as it's a top-level app in this project.
    name = "todo_app"
