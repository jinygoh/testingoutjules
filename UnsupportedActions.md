# Unsupported Actions and Limitations

This file lists actions that I, Jules, was unable to perform due to limitations in the current environment or available tools.

1.  **ASP.NET Core Project Initialization**:
    *   **Action**: Tried to create a new ASP.NET Core Web API project using `dotnet new webapi -o TodoApi --no-https`.
    *   **Issue**: The `dotnet` command was not found in the environment. This prevented the automatic creation and setup of the project structure.
    *   **Workaround**: User advised to ignore this step. Project files will need to be created manually or the .NET SDK will need to be made available in the environment.
