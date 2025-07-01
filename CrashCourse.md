# ASP.NET Core Crash Course

Welcome to this ASP.NET Core crash course! This document will guide you through the fundamental concepts of building web applications and APIs using ASP.NET Core. We'll be referencing examples from the `TodoApi` project we're building together.

## 1. Introduction to ASP.NET Core

*   **What is ASP.NET Core?**
    *   A cross-platform, high-performance, open-source framework for building modern, cloud-based, internet-connected applications.
    *   Developed by Microsoft and the community.
    *   Can run on Windows, macOS, and Linux.
*   **Why use ASP.NET Core?**
    *   **Performance**: One of the fastest web frameworks available.
    *   **Cross-platform**: Develop and run your applications anywhere.
    *   **Open-source**: Large community and active development.
    *   **Unified MVC and Web API**: A single framework for building web UI and web APIs.
    *   **Dependency Injection (DI)**: Built-in support for DI, making applications more modular and testable.
    *   **Middleware**: A powerful pipeline for handling HTTP requests and responses.

## 2. Core Concepts

### 2.1. Project Structure (Illustrative - based on a typical `dotnet new webapi` project)

*(Note: Since we couldn't auto-initialize the project, this section describes a typical structure. We will create these files manually.)*

*   `TodoApi/` (Root Project Folder)
    *   `Program.cs`: The entry point of the application. Configures and starts the web host.
        *   *Example (Conceptual)*: `TodoApi/Program.cs`
    *   `Startup.cs` (in older .NET versions) or combined into `Program.cs` (in .NET 6+): Configures services and the HTTP request pipeline.
        *   *Example (Conceptual)*: `TodoApi/Program.cs` (for .NET 6+)
    *   `Controllers/`: Contains controller classes that handle incoming HTTP requests.
        *   *Example*: `TodoApi/Controllers/TodoController.cs` (We will create this)
    *   `Models/`: Contains model classes representing the data in the application.
        *   *Example*: `TodoApi/Models/TodoItem.cs` (We will create this)
    *   `appsettings.json`: Configuration file (e.g., database connection strings).
    *   `Properties/launchSettings.json`: Development environment launch settings.

### 2.2. `Program.cs` (Entry Point & Host Configuration - .NET 6+ style)

This file is where your application starts.
*   It sets up the web server (Kestrel by default).
*   It configures services that the application will use.
*   It defines the middleware pipeline that handles requests.

```csharp
// TodoApi/Program.cs (Illustrative - We will create this later)

// 1. Create a new WebApplicationBuilder.
// This initializes a new web application.
var builder = WebApplication.CreateBuilder(args);

// 2. Add services to the container.
// Services are components that provide functionality to your application.
// For a Web API, 'AddControllers' registers controller services.
builder.Services.AddControllers();

// Example: Adding Swagger for API documentation (optional, but good practice)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. Build the application.
var app = builder.Build();

// 4. Configure the HTTP request pipeline (Middleware).
// Middleware components process HTTP requests and responses.
// Order matters here.

// Example: Use Swagger in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Usually enabled for production

app.UseAuthorization(); // Adds authorization capabilities

// Maps controller actions to routes.
// This allows requests like GET /api/todo to be routed to TodoController.GetTodoItems().
app.MapControllers();

// 5. Run the application.
// This starts the web server and begins listening for HTTP requests.
app.Run();
```

### 2.3. Controllers

*   Handle incoming HTTP requests (GET, POST, PUT, DELETE, etc.).
*   Retrieve data from models/services and return HTTP responses (e.g., JSON, HTML).
*   Located in the `Controllers` directory.
*   Typically inherit from `ControllerBase` (for APIs) or `Controller` (for MVC with Views).
*   Use attributes like `[ApiController]`, `[Route("[controller]")]`, `[HttpGet]`, `[HttpPost]` to define behavior and routing.
    *   *Example*: We will create `TodoApi/Controllers/TodoController.cs`.

### 2.4. Models

*   Represent the data structures of your application (e.g., a `TodoItem` with properties like `Id`, `Name`, `IsComplete`).
*   Plain Old CLR Objects (POCOs).
*   Located in the `Models` directory.
    *   *Example*: We will create `TodoApi/Models/TodoItem.cs`.

### 2.5. Routing

*   How URLs are matched to controller actions.
*   ASP.NET Core uses a flexible routing system.
*   **Attribute Routing**: Defined directly on controller actions (e.g., `[HttpGet("active")]`). This is common for APIs.
*   **Convention-based Routing**: Defined globally in `Program.cs` (more common for MVC with Views).

### 2.6. Dependency Injection (DI)

*   A design pattern where objects receive their dependencies rather than creating them.
*   ASP.NET Core has built-in support for DI.
*   **Services** are registered in `Program.cs` (e.g., `builder.Services.AddScoped<IMyService, MyService>();`).
*   **Dependencies** are then injected into constructors or action methods.
    *   *Example*: When we create a service for data access, we'll inject it into `TodoController`.

### 2.7. Middleware

*   Software components assembled into an application pipeline to handle requests and responses.
*   Each component:
    *   Chooses whether to pass the request to the next component.
    *   Can perform work before and after the next component in the pipeline.
*   Configured in `Program.cs` using `app.Use...()` methods (e.g., `app.UseAuthentication()`, `app.UseStaticFiles()`).
*   The order of middleware is crucial.

## 3. Building a Simple API (TodoApi Example)

*(This section links to the files we've created for the `TodoApi` project.)*

### 3.1. Creating the Model (`TodoItem.cs`)
*   Purpose: Defines the structure of our To-do items (e.g., ID, Name, IsComplete).
*   Location: `TodoApi/Models/TodoItem.cs`
*   **See the code**: [TodoApi/Models/TodoItem.cs](TodoApi/Models/TodoItem.cs)

### 3.2. Creating the Controller (`TodoController.cs`)
*   Purpose: Handles incoming HTTP requests for To-do items (e.g., GET, POST, PUT, DELETE) and uses the `TodoItem` model. It contains the logic for CRUD (Create, Read, Update, Delete) operations.
*   Location: `TodoApi/Controllers/TodoController.cs`
*   **See the code**: [TodoApi/Controllers/TodoController.cs](TodoApi/Controllers/TodoController.cs)

### 3.3. Setting up `Program.cs`
*   Purpose: The entry point of our application. It configures essential services (like controllers) and defines the HTTP request processing pipeline (middleware).
*   Location: `TodoApi/Program.cs`
*   **See the code**: [TodoApi/Program.cs](TodoApi/Program.cs)

### 3.4. Serving Static Files for a Frontend (`wwwroot`)
*   ASP.NET Core serves static files (like HTML, CSS, JavaScript) from the `wwwroot` directory by default.
*   We added `app.UseDefaultFiles()` (to serve `index.html` for root requests) and `app.UseStaticFiles()` in `Program.cs` to enable this.
*   Our simple frontend consists of:
    *   `TodoApi/wwwroot/index.html`: The main HTML page.
    *   `TodoApi/wwwroot/css/site.css`: Basic styles for the page.
    *   `TodoApi/wwwroot/js/site.js`: JavaScript to call our Todo API and update the HTML.
*   **See the frontend files**:
    *   [TodoApi/wwwroot/index.html](TodoApi/wwwroot/index.html)
    *   [TodoApi/wwwroot/js/site.js](TodoApi/wwwroot/js/site.js)
    *   [TodoApi/wwwroot/css/site.css](TodoApi/wwwroot/css/site.css)

### 3.5. Understanding API Endpoints (Examples from `TodoController.cs`)
*   `GET /api/todo`: Get all todo items.
*   `GET /api/todo/{id}`: Get a specific todo item.
*   `POST /api/todo`: Create a new todo item.
*   `PUT /api/todo/{id}`: Update an existing todo item.
*   `DELETE /api/todo/{id}`: Delete a todo item.

## 4. Data Persistence (Brief Overview)

*   **In-Memory Store**: Simple for examples, data is lost when the app stops. (We might start with this).
*   **Entity Framework Core (EF Core)**: An Object-Relational Mapper (ORM) that enables .NET developers to work with a database using .NET objects.
    *   Supports many databases (SQL Server, PostgreSQL, SQLite, MySQL, etc.).
    *   Involves creating a `DbContext` and `DbSet<T>` properties.
*   **Other Options**: Dapper (micro-ORM), NoSQL databases.

## 5. Next Steps & Further Learning

*   **Error Handling**: Implement robust error handling (e.g., global exception handlers).
*   **Validation**: Enhance data validation (e.g., using FluentValidation or more data annotations).
*   **Authentication & Authorization**: Secure your API (e.g., using JWT Bearer tokens or IdentityServer).
*   **Logging**: Implement comprehensive logging (e.g., to files or a logging service like Serilog or Seq).
*   **Testing**: Write unit and integration tests.
    *   We've created an example unit test suite for our controller: [TodoApi.Tests/TodoControllerTests.cs](TodoApi.Tests/TodoControllerTests.cs).
    *   Note: Running these tests requires a .NET SDK environment to compile and execute the test project.
*   **Configuration**: Manage application settings for different environments (e.g., using `appsettings.Development.json`).
*   **Deployment**: Learn how to deploy your ASP.NET Core application (e.g., to IIS, Docker, Azure, AWS).
*   **Official Documentation**: The Microsoft ASP.NET Core documentation is an excellent resource.

---

This document will evolve as we build the `TodoApi` project. Stay tuned!
