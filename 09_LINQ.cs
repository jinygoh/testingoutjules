// C# Crash Course - 09_LINQ.cs
using System;
using System.Collections.Generic;
using System.Linq; // Essential for LINQ extension methods

namespace LINQDemo
{
    // Sample class to query
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public double Price { get; set; }
        public int UnitsInStock { get; set; }

        public override string ToString()
        {
            return $"ID: {Id}, Name: {Name}, Category: {Category}, Price: {Price:C}, Stock: {UnitsInStock}";
        }
    }

    class Program
    {
        // Helper method to get a list of sample products
        public static List<Product> GetSampleProducts()
        {
            return new List<Product>
            {
                new Product { Id = 1, Name = "Laptop Pro", Category = "Electronics", Price = 1200.00, UnitsInStock = 10 },
                new Product { Id = 2, Name = "Wireless Mouse", Category = "Electronics", Price = 25.00, UnitsInStock = 50 },
                new Product { Id = 3, Name = "Office Chair", Category = "Furniture", Price = 150.00, UnitsInStock = 20 },
                new Product { Id = 4, Name = "Coffee Maker", Category = "Appliances", Price = 75.00, UnitsInStock = 30 },
                new Product { Id = 5, Name = "Desk Lamp", Category = "Furniture", Price = 40.00, UnitsInStock = 0 },
                new Product { Id = 6, Name = "Smartphone X", Category = "Electronics", Price = 800.00, UnitsInStock = 15 },
                new Product { Id = 7, Name = "Bookshelf", Category = "Furniture", Price = 90.00, UnitsInStock = 5 },
                new Product { Id = 8, Name = "Gaming Keyboard", Category = "Electronics", Price = 120.00, UnitsInStock = 25 }
            };
        }

        static void Main(string[] args)
        {
            Console.WriteLine("--- C# LINQ Demo ---");
            Console.WriteLine();

            List<int> numbers = new List<int> { 5, 10, 2, 8, 3, 1, 9, 4, 7, 6 };
            List<Product> products = GetSampleProducts();

            // --- 1. Where (Filtering) ---
            Console.WriteLine("--- 1. Where (Filtering) ---");
            // Method Syntax
            IEnumerable<int> evenNumbers = numbers.Where(n => n % 2 == 0);
            Console.WriteLine("Even numbers (Method Syntax): " + string.Join(", ", evenNumbers));

            // Query Syntax (equivalent)
            IEnumerable<int> oddNumbersQuery = from n in numbers
                                               where n % 2 != 0
                                               select n;
            Console.WriteLine("Odd numbers (Query Syntax): " + string.Join(", ", oddNumbersQuery.ToList())); // .ToList() to execute

            IEnumerable<Product> electronicsProducts = products.Where(p => p.Category == "Electronics");
            Console.WriteLine("\nElectronics Products:");
            foreach (var product in electronicsProducts) Console.WriteLine(product);
            Console.WriteLine();


            // --- 2. Select (Projection) ---
            Console.WriteLine("--- 2. Select (Projection) ---");
            IEnumerable<string> productNames = products.Select(p => p.Name);
            Console.WriteLine("Product Names: " + string.Join(", ", productNames));

            // Projecting to an anonymous type
            var productInfo = products.Select(p => new { ProductName = p.Name, ProductPrice = p.Price });
            Console.WriteLine("\nProduct Info (Anonymous Type):");
            foreach (var info in productInfo) Console.WriteLine($"Name: {info.ProductName}, Price: {info.ProductPrice:C}");
            Console.WriteLine();


            // --- 3. OrderBy / OrderByDescending ---
            Console.WriteLine("--- 3. OrderBy / OrderByDescending ---");
            IEnumerable<Product> sortedByName = products.OrderBy(p => p.Name);
            Console.WriteLine("Products sorted by Name (Ascending):");
            foreach (var product in sortedByName) Console.WriteLine(product);

            IEnumerable<Product> sortedByPriceDesc = products.OrderByDescending(p => p.Price);
            Console.WriteLine("\nProducts sorted by Price (Descending):");
            foreach (var product in sortedByPriceDesc) Console.WriteLine(product);
            Console.WriteLine();

            // --- 4. ThenBy / ThenByDescending ---
            Console.WriteLine("--- 4. ThenBy / ThenByDescending ---");
            IEnumerable<Product> sortedByCategoryThenName = products
                .OrderBy(p => p.Category)
                .ThenBy(p => p.Name);
            Console.WriteLine("Products sorted by Category (Asc) then Name (Asc):");
            foreach (var product in sortedByCategoryThenName) Console.WriteLine(product);
            Console.WriteLine();


            // --- 5. First / FirstOrDefault ---
            Console.WriteLine("--- 5. First / FirstOrDefault ---");
            Product firstElectronic = products.First(p => p.Category == "Electronics");
            Console.WriteLine($"First Electronic Product: {firstElectronic.Name}");

            Product nonExistentCategoryProduct = products.FirstOrDefault(p => p.Category == "Toys");
            Console.WriteLine($"First 'Toys' Product: {(nonExistentCategoryProduct == null ? "Not Found" : nonExistentCategoryProduct.Name)}");

            try
            {
                Product mustExist = products.First(p => p.Price > 2000); // Will throw if none found
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"Exception finding product > $2000: {ex.Message}");
            }
            Console.WriteLine();

            // --- 6. Single / SingleOrDefault ---
            Console.WriteLine("--- 6. Single / SingleOrDefault ---");
            Product coffeeMaker = products.Single(p => p.Name == "Coffee Maker");
            Console.WriteLine($"Single product 'Coffee Maker': {coffeeMaker.Name}");
            try
            {
                // This will throw because multiple electronics products exist
                // Product singleElectronic = products.Single(p => p.Category == "Electronics");
                // This will throw because no product with ID 999 exists
                Product product999 = products.SingleOrDefault(p => p.Id == 999);
                 Console.WriteLine($"Product with ID 999: {(product999 == null ? "Not Found" : product999.Name)}");

                // Example that would throw if more than one matches
                // products.Add(new Product { Id = 9, Name = "Coffee Maker", Category = "Appliances", Price = 70.00, UnitsInStock = 1 });
                // Product anotherCoffeeMaker = products.SingleOrDefault(p => p.Name == "Coffee Maker"); // Throws if uncommented
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"Exception with Single/SingleOrDefault: {ex.Message}");
            }
            Console.WriteLine();


            // --- 7. Any ---
            Console.WriteLine("--- 7. Any ---");
            bool hasProductsOutOfStock = products.Any(p => p.UnitsInStock == 0);
            Console.WriteLine($"Are there any products out of stock? {hasProductsOutOfStock}"); // True (Desk Lamp)
            Console.WriteLine();

            // --- 8. All ---
            Console.WriteLine("--- 8. All ---");
            bool allProductsHaveStock = products.All(p => p.UnitsInStock > 0);
            Console.WriteLine($"Do all products have stock? {allProductsHaveStock}"); // False
            Console.WriteLine();

            // --- 9. Count ---
            Console.WriteLine("--- 9. Count ---");
            int totalProducts = products.Count();
            Console.WriteLine($"Total number of products: {totalProducts}");
            int furnitureCount = products.Count(p => p.Category == "Furniture");
            Console.WriteLine($"Number of furniture products: {furnitureCount}");
            Console.WriteLine();

            // --- 10. Sum, Average, Min, Max (Aggregation) ---
            Console.WriteLine("--- 10. Aggregation (Sum, Average, Min, Max) ---");
            double totalStockValue = products.Sum(p => p.Price * p.UnitsInStock);
            Console.WriteLine($"Total stock value: {totalStockValue:C}");

            double averagePriceElectronics = products
                .Where(p => p.Category == "Electronics")
                .Average(p => p.Price);
            Console.WriteLine($"Average price of electronics: {averagePriceElectronics:C}");

            double maxPrice = products.Max(p => p.Price);
            Console.WriteLine($"Maximum product price: {maxPrice:C}");

            double minPriceInStock = products
                .Where(p => p.UnitsInStock > 0) // Consider only items in stock
                .Min(p => p.Price);
            Console.WriteLine($"Minimum price of in-stock products: {minPriceInStock:C}");
            Console.WriteLine();

            // --- 11. ToList(), ToArray() (Materialization) ---
            Console.WriteLine("--- 11. Materialization (ToList, ToArray) ---");
            // The query 'expensiveProductsQuery' is defined but not yet executed.
            IEnumerable<Product> expensiveProductsQuery = products.Where(p => p.Price > 100);

            // Now execute the query and store results in a List
            List<Product> expensiveProductsList = expensiveProductsQuery.ToList();
            Console.WriteLine("Expensive products (Price > $100) - from List:");
            foreach (var product in expensiveProductsList) Console.WriteLine(product);

            // Deferred execution example:
            Console.WriteLine("\nDeferred Execution Example:");
            var furnitureQuery = products.Where(p => p.Category == "Furniture");
            Console.WriteLine($"Count before adding new furniture: {furnitureQuery.Count()}"); // Query executed here

            products.Add(new Product { Id = 9, Name = "New Table", Category = "Furniture", Price = 250.00, UnitsInStock = 3 });

            Console.WriteLine($"Count after adding new furniture: {furnitureQuery.Count()}"); // Query executed again, includes new item
            Console.WriteLine("Contents of furnitureQuery after adding new item:");
            foreach(var p in furnitureQuery) Console.WriteLine(p); // Query executed again
            Console.WriteLine();

            // GroupBy (More advanced, but very useful)
            Console.WriteLine("--- GroupBy Example ---");
            var productsByCategory = products.GroupBy(p => p.Category);

            foreach (var group in productsByCategory)
            {
                Console.WriteLine($"Category: {group.Key}"); // Key is the category name
                foreach (Product product in group)
                {
                    Console.WriteLine($"  - {product.Name} (Price: {product.Price:C})");
                }
                Console.WriteLine($"  Total products in {group.Key}: {group.Count()}");
                Console.WriteLine($"  Average price in {group.Key}: {group.Average(p => p.Price):C}");
                Console.WriteLine();
            }


            Console.WriteLine("--- End of LINQ Demo ---");
        }
    }
}
