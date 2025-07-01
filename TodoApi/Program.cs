// TodoApi/Program.cs
// This file is the main entry point for the ASP.NET Core application.
// Responsibilities:
// 1. Setting up the web application host (WebApplicationBuilder, WebApplication).
// 2. Registering services for Dependency Injection (DI). For example, controllers, database contexts, custom services.
// 3. Configuring the HTTP request processing pipeline (middleware). This defines how incoming requests are handled.
// This setup is typical for .NET 6 and later versions, using the minimal API hosting model.

// Create a new WebApplicationBuilder.
// The builder is used to configure services and the application itself.
// 'args' can be used to pass command-line arguments to the application configuration.
var builder = WebApplication.CreateBuilder(args);

// Add services to the dependency injection (DI) container.
// Services are components that provide functionality to your application.

// builder.Services.AddControllers() registers all classes decorated with [ApiController]
// (typically found in the Controllers directory) so they can handle HTTP requests.
// It also adds features commonly needed for controllers, like model binding, validation, and JSON formatting.
builder.Services.AddControllers();

// The following two lines are often added to enable API exploration and Swagger UI
// for API documentation and testing.
// AddEndpointsApiExplorer() is needed for minimal APIs and API controllers to be discovered by Swagger/OpenAPI.
builder.Services.AddEndpointsApiExplorer();
// AddSwaggerGen() registers the Swagger generator, which builds Swagger/OpenAPI documents
// that describe your API. These documents are then used by Swagger UI.
builder.Services.AddSwaggerGen();

// Build the WebApplication instance from the configured builder.
// 'app' represents the configured web application that will handle requests.
var app = builder.Build();

// Configure the HTTP request pipeline (middleware).
// Middleware components process HTTP requests and responses in a sequence.
// The order in which middleware is added is important.

// UseSwagger() adds the Swagger middleware to serve the generated OpenAPI specification
// (usually at /swagger/v1/swagger.json).
// UseSwaggerUI() adds middleware to serve the Swagger UI (an interactive API documentation UI),
// typically accessible at /swagger.
// This block conditionally enables Swagger only in the Development environment
// to avoid exposing API documentation in production unless explicitly desired.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// UseHttpsRedirection() middleware redirects HTTP requests to HTTPS.
// This is commented out because the initial project setup specified --no-https.
// In a production application, you would typically enable this.
// app.UseHttpsRedirection();

// UseDefaultFiles must be called before UseStaticFiles to serve the default file (e.g. index.html)
// for requests to a directory. This allows navigating to the root of the site to load index.html.
app.UseDefaultFiles();
// UseStaticFiles enables serving static files from the web root path (wwwroot by default).
// This is necessary for our index.html, js/site.js, and css/site.css to be accessible by the browser.
app.UseStaticFiles();

// UseAuthorization() middleware enables authorization capabilities.
// It should typically be placed after authentication middleware if authentication is used.
app.UseAuthorization();

// MapControllers() adds endpoints for controller actions to the IEndpointRouteBuilder.
// This middleware is responsible for routing incoming HTTP requests to the appropriate
// controller actions based on attributes like [Route], [HttpGet], [HttpPost], etc.
// For example, a request to GET /api/todo will be routed to the GetTodoItems method
// in TodoController if it's configured with appropriate attributes.
app.MapControllers();

// Run the application.
// This starts the web server and makes the application listen for incoming HTTP requests
// on the configured ports.
app.Run();
