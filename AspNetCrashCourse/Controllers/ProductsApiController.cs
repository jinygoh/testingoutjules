// AspNetCrashCourse/Controllers/ProductsApiController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AspNetCrashCourse.Data;
using AspNetCrashCourse.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AspNetCrashCourse.Controllers
{
    [Route("api/[controller]")] // Defines the route template for this controller: "api/ProductsApi"
    [ApiController] // Indicates this is an API controller
    public class ProductsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ProductsApi
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            // ActionResult<T> allows returning either a type deriving from ActionResult (like NotFound()) or the specified type (IEnumerable<Product>)
            var products = await _context.Products.ToListAsync();
            if (products == null || !products.Any())
            {
                // You might return an empty list instead of NotFound if that's preferred for your API design
                // return Ok(new List<Product>());
                return NotFound("No products found.");
            }
            return Ok(products); // Ok() returns a 200 OK status with the data
        }

        // GET: api/ProductsApi/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound(); // Returns a 404 Not Found status
            }

            return Ok(product);
        }

        // POST: api/ProductsApi
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Returns a 400 Bad Request status with validation errors
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Returns a 201 Created status, with a Location header pointing to the new resource, and the new resource in the body.
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // PUT: api/ProductsApi/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest("Product ID in URL must match Product ID in body."); // Returns a 400 Bad Request
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Entry(product).State = EntityState.Modified; // Mark the entity as modified

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound(); // Returns 404 if trying to update a non-existent product
                }
                else
                {
                    throw; // Re-throw exception if it's a genuine concurrency issue
                }
            }

            return NoContent(); // Returns a 204 No Content status, indicating success but no content to return
        }


        // DELETE: api/ProductsApi/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(); // Returns 404 if product to delete is not found
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent(); // Returns a 204 No Content
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}
