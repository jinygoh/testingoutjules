const express = require('express');
const app = express();
const port = 3000;

// MIDDLEWARE to parse JSON request bodies (needed for POST/PUT requests)
// This should come before your route definitions that need to parse JSON.
app.use(express.json()); // For parsing application/json

// --- Basic Route Definitions ---

// GET request to the homepage
app.get('/', (req, res) => {
  res.send('Welcome to the Routing Example Homepage!');
});

// GET request to /about
app.get('/about', (req, res) => {
  res.send('This is the About page.');
});

// POST request to /submit-data
app.post('/submit-data', (req, res) => {
  console.log('Data received:', req.body); // req.body contains the parsed JSON data
  res.status(201).send(`Data received: ${JSON.stringify(req.body)}`);
});

// PUT request to /update-data
app.put('/update-data', (req, res) => {
  console.log('Data to update:', req.body);
  res.send(`Data updated with: ${JSON.stringify(req.body)}`);
});

// DELETE request to /delete-item
app.delete('/delete-item', (req, res) => {
  // In a real app, you'd identify what to delete via req.params or req.body
  res.send('Item deleted (simulated).');
});


// --- Route Parameters ---
// Route parameters are named URL segments used to capture values specified at their position in the URL.
// The captured values are populated in the req.params object.

// GET request with a user ID parameter
app.get('/users/:userId', (req, res) => {
  const userId = req.params.userId;
  res.send(`Fetching information for User ID: ${userId}`);
});

// GET request with multiple parameters: userId and bookId
app.get('/users/:userId/books/:bookId', (req, res) => {
  const userId = req.params.userId;
  const bookId = req.params.bookId;
  res.send(`Fetching Book ID: ${bookId} for User ID: ${userId}`);
});


// --- Route Handlers ---
// You can have multiple handler functions for a single route.
// These functions must either call next() to pass control to the next handler
// or end the request-response cycle.

const handler1 = (req, res, next) => {
  console.log('First handler executed!');
  req.customProperty = 'Set by Handler 1'; // You can add properties to req
  next(); // Pass control to the next handler
};

const handler2 = (req, res) => {
  console.log('Second handler executed!');
  res.send(`Response from second handler. Custom property: ${req.customProperty}`);
};

app.get('/multi-handlers', [handler1, handler2]);

// You can also chain route handlers for the same path but different HTTP methods
app.route('/item')
  .get((req, res) => {
    res.send('Get an item');
  })
  .post((req, res) => {
    // Assuming express.json() middleware is used
    console.log('Item data:', req.body);
    res.status(201).send(`Create an item with data: ${JSON.stringify(req.body)}`);
  })
  .put((req, res) => {
    // Assuming express.json() middleware is used
    console.log('Item data to update:', req.body);
    res.send(`Update an item with data: ${JSON.stringify(req.body)}`);
  });


// --- Modular Routing using express.Router ---
// For larger applications, it's good practice to separate routes into different files.
// Create a router instance for a specific part of your application.

const productsRouter = express.Router();

// All routes defined on productsRouter will be prefixed with /products (see app.use below)

productsRouter.get('/', (req, res) => {
  res.send('List all products.');
});

productsRouter.get('/:productId', (req, res) => {
  res.send(`View product with ID: ${req.params.productId}`);
});

productsRouter.post('/', (req, res) => {
  // Assuming express.json() middleware is used
  console.log('New product data:', req.body);
  res.status(201).send(`Product created with data: ${JSON.stringify(req.body)}`);
});

// Mount the router on a specific path in the main app
app.use('/products', productsRouter); // All routes in productsRouter are now prefixed with /products

// Example:
// GET /products -> handled by productsRouter.get('/')
// GET /products/123 -> handled by productsRouter.get('/:productId')
// POST /products -> handled by productsRouter.post('/')


app.listen(port, () => {
  console.log(`Routing example app listening at http://localhost:${port}`);
  console.log('Try visiting:');
  console.log(`  http://localhost:${port}/`);
  console.log(`  http://localhost:${port}/about`);
  console.log(`  http://localhost:${port}/users/123`);
  console.log(`  http://localhost:${port}/users/abc/books/xyz`);
  console.log(`  http://localhost:${port}/multi-handlers`);
  console.log(`  http://localhost:${port}/item (try GET, POST, PUT)`);
  console.log(`  http://localhost:${port}/products`);
  console.log(`  http://localhost:${port}/products/456`);
  console.log('\nFor POST/PUT requests, use a tool like Postman or curl.');
  console.log('Example using curl for POST /submit-data:');
  console.log(`  curl -X POST -H "Content-Type: application/json" -d '{"name":"John Doe", "age":30}' http://localhost:${port}/submit-data`);
  console.log('Example using curl for POST /products:');
  console.log(`  curl -X POST -H "Content-Type: application/json" -d '{"name":"Laptop", "price":1200}' http://localhost:${port}/products`);

});

/*
How to run this file:
1. Ensure Node.js and npm are installed.
2. In your project directory, run `npm install express`.
3. Save this code as `03-routing.js`.
4. Run from terminal: `node 03-routing.js`
5. Open your browser and test the GET routes mentioned in the console.
6. For POST, PUT, DELETE requests, use a tool like Postman, Insomnia, or curl.

Example curl commands (run in a separate terminal window):
*   POST to /submit-data:
    curl -X POST -H "Content-Type: application/json" -d '{"name":"John Doe", "age":30}' http://localhost:3000/submit-data
*   PUT to /update-data:
    curl -X PUT -H "Content-Type: application/json" -d '{"id":1, "status":"completed"}' http://localhost:3000/update-data
*   DELETE to /delete-item:
    curl -X DELETE http://localhost:3000/delete-item
*   GET an item:
    curl http://localhost:3000/item
*   POST to /item:
    curl -X POST -H "Content-Type: application/json" -d '{"itemName":"My New Item"}' http://localhost:3000/item
*   POST to /products:
    curl -X POST -H "Content-Type: application/json" -d '{"name":"Awesome Gadget", "price":99.99}' http://localhost:3000/products
*/
