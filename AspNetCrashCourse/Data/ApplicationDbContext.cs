// AspNetCrashCourse/Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using AspNetCrashCourse.Models; // Ensure this namespace matches your Product model location

namespace AspNetCrashCourse.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }

        // If you had other models, you would add other DbSet properties here
        // public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // You can use this method to configure your model further using Fluent API
            // For example, seeding data:
            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 101, Name = "EF Core Seeded Laptop", Price = 1399.99m },
                new Product { Id = 102, Name = "EF Core Seeded Mouse", Price = 29.50m },
                new Product { Id = 103, Name = "EF Core Seeded Keyboard", Price = 85.00m }
            );
        }
    }
}
