// AspNetCrashCourse/Program.cs
using Microsoft.EntityFrameworkCore;
using AspNetCrashCourse.Data; // Will be created in the EF Core step
using AspNetCrashCourse.Models;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// This DbContext registration will be more relevant when EF Core is fully set up.
// For now, ProductController uses an in-memory list.
// We add it here to prepare for the EF Core step and avoid having to change Program.cs later.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection") ??
    throw new InvalidOperationException("Connection string 'DefaultConnection' not found.")));

builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Enables serving static files from wwwroot

app.UseRouting();

app.UseAuthorization(); // This would be important if we add authentication/authorization

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// This line is important for API controllers if they don't use attribute routing fully
// or if you want to ensure API controller routing is picked up.
// Attribute routing on controllers like [Route("api/[controller]")] is generally preferred for APIs.
// app.MapControllers(); // Will be uncommented/added when API controller is made
app.MapControllers(); // This is important for API controllers to be routed correctly.

app.Run();
