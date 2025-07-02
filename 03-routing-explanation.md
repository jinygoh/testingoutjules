# Express.js Crash Course: Routing

Routing refers to how an application's endpoints (URIs) respond to client requests. In Express, you define routes by specifying an HTTP method (like GET, POST, etc.), a URL path pattern, and one or more handler functions.

Let's break down the concepts in `03-routing.js`:

## Basic Route Definitions

The fundamental structure of a route definition is:
`app.METHOD(PATH, HANDLER)`

*   `app`: An instance of Express.
*   `METHOD`: An HTTP request method in lowercase (e.g., `app.get()`, `app.post()`, `app.put()`, `app.delete()`).
*   `PATH`: A string or pattern representing the URL path on the server.
*   `HANDLER`: A function (or array of functions) that Express calls when the route is matched. This function receives the request (`req`) and response (`res`) objects.

```javascript
// GET request to the homepage
app.get('/', (req, res) => {
  res.send('Welcome to the Routing Example Homepage!');
});

// POST request to /submit-data
// Note: To handle JSON in req.body, you need middleware: app.use(express.json());
app.post('/submit-data', (req, res) => {
  console.log('Data received:', req.body);
  res.status(201).send(`Data received: ${JSON.stringify(req.body)}`);
});
```
*   `app.get('/about', ...)` defines a response for GET requests to `/about`.
*   `app.post('/submit-data', ...)` defines a response for POST requests to `/submit-data`.
    *   `req.body`: To access data sent in the body of a POST, PUT, or PATCH request (e.g., from a form or a JSON payload), you need middleware to parse it. `app.use(express.json());` is used for parsing `application/json` payloads.
    *   `res.status(201)`: Sets the HTTP status code for the response. `201` means "Created", often used after a successful POST request.

## Route Parameters

Route parameters are named URL segments used to capture values specified at their position in the URL. The captured values are populated in the `req.params` object, with the name of the route parameter specified in the path as their respective keys.

```javascript
// GET request with a user ID parameter
app.get('/users/:userId', (req, res) => {
  const userId = req.params.userId; // If URL is /users/123, userId will be "123"
  res.send(`Fetching information for User ID: ${userId}`);
});

// GET request with multiple parameters
app.get('/users/:userId/books/:bookId', (req, res) => {
  const userId = req.params.userId;
  const bookId = req.params.bookId;
  res.send(`Fetching Book ID: ${bookId} for User ID: ${userId}`);
});
```
*   `:userId` and `:bookId` are route parameters.
*   If you navigate to `/users/42/books/3`, then `req.params` would be `{ userId: '42', bookId: '3' }`.

## Route Handlers

You can provide multiple callback functions that behave like middleware to handle a request. The only exception is that these callbacks might invoke `next('route')` to bypass the remaining route callbacks.

```javascript
const handler1 = (req, res, next) => {
  console.log('First handler executed!');
  req.customProperty = 'Set by Handler 1'; // You can modify the req object
  next(); // Pass control to the next handler in the chain
};

const handler2 = (req, res) => {
  console.log('Second handler executed!');
  res.send(`Response from second handler. Custom property: ${req.customProperty}`);
};

// Route with multiple handlers
app.get('/multi-handlers', [handler1, handler2]);
```
*   When a request hits `/multi-handlers`, `handler1` is executed.
*   `handler1` calls `next()`, which passes control to `handler2`.
*   `handler2` sends the response. If `handler1` had sent a response, `handler2` would not be called.

You can also use `app.route()` to create chainable route handlers for a route path. Because the path is specified at a single location, creating modular routes is helpful, as is reducing redundancy and typos.

```javascript
app.route('/item')
  .get((req, res) => {
    res.send('Get an item');
  })
  .post((req, res) => {
    res.status(201).send('Create an item');
  });
```
This is equivalent to:
```javascript
app.get('/item', (req, res) => { /* ... */ });
app.post('/item', (req, res) => { /* ... */ });
```

## Modular Routing using `express.Router`

For larger applications, it's common to group related routes into separate files using `express.Router`. This makes your codebase more organized and manageable.

1.  **Create a router instance:** `const productsRouter = express.Router();`
2.  **Define routes on the router instance:**
    ```javascript
    // In a separate file like 'productsRouter.js' (conceptually)
    productsRouter.get('/', (req, res) => {
      res.send('List all products.');
    });

    productsRouter.get('/:productId', (req, res) => {
      res.send(`View product with ID: ${req.params.productId}`);
    });
    ```
3.  **Mount the router in your main app file:**
    ```javascript
    // In your main app file (e.g., 03-routing.js or app.js)
    app.use('/products', productsRouter);
    ```
    *   Now, any request to `/products` will be handled by `productsRouter`.
    *   A GET request to `/products` will match `productsRouter.get('/')`.
    *   A GET request to `/products/123` will match `productsRouter.get('/:productId')`.

## How to Test

*   **GET routes:** Can be tested directly in your web browser (e.g., `http://localhost:3000/users/5`).
*   **POST, PUT, DELETE routes:** Require a tool that can send these types of HTTP requests. Popular choices include:
    *   **Postman:** A GUI application for API testing.
    *   **Insomnia:** Another GUI application for API testing.
    *   **curl:** A command-line tool.

**Example using `curl` for a POST request:**
(Make sure `app.use(express.json());` is included in your app to parse the JSON body)

```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"name":"My Item", "value":100}' \
     http://localhost:3000/submit-data
```

This sends a POST request to `/submit-data` with a JSON body. The server (if `03-routing.js` is running) will log the data and send a response.

Routing is a cornerstone of Express.js, allowing you to define how your application responds to different client requests based on URL patterns and HTTP methods. Mastering routing is crucial for building web applications and APIs. Remember to use `express.Router` to keep your application organized as it grows.
