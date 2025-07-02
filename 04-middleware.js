const express = require('express');
const app = express();
const port = 3000;

// --- What is Middleware? ---
// Middleware functions are functions that have access to the request object (req),
// the response object (res), and the next middleware function in the application’s
// request-response cycle. The next middleware function is commonly denoted by a
// variable named next.

// Middleware functions can perform the following tasks:
// - Execute any code.
// - Make changes to the request and the response objects.
// - End the request-response cycle.
// - Call the next middleware in the stack.
// If the current middleware function does not end the request-response cycle,
// it must call next() to pass control to the next middleware function. Otherwise,
// the request will be left hanging.


// --- Application-level Middleware (using app.use()) ---

// 1. Simple Logger Middleware (Custom Middleware)
const loggerMiddleware = (req, res, next) => {
  console.log('--------------------');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  if (Object.keys(req.body).length > 0) {
    console.log('Request Body:', req.body);
  }
  next(); // Pass control to the next middleware or route handler
};

// To parse JSON bodies (Built-in middleware) - MUST be before routes that need it
app.use(express.json());
// To parse URL-encoded bodies (Built-in middleware) - e.g., from HTML forms
app.use(express.urlencoded({ extended: true }));

// Apply the logger middleware to all requests
app.use(loggerMiddleware);


// 2. Authentication Middleware Example (Custom Middleware)
const authMiddleware = (req, res, next) => {
  const apiKey = req.query.apiKey; // Example: check for an API key in query string
  if (apiKey === 'mysecretkey') {
    console.log('Auth successful');
    next(); // Authorized, proceed to the next middleware or route handler
  } else {
    console.log('Auth failed: Invalid or missing API key');
    res.status(401).send('Unauthorized: Access is denied due to invalid credentials.');
    // No next() call here, so the request-response cycle ends.
  }
};

// Apply authMiddleware only to routes starting with /admin
app.use('/admin', authMiddleware);


// --- Routes to demonstrate middleware ---
app.get('/', (req, res) => {
  res.send('Homepage - Publicly accessible');
});

app.post('/data', (req, res) => {
  // Thanks to express.json(), req.body is populated for JSON requests
  // Thanks to express.urlencoded(), req.body is populated for form submissions
  res.send(`Data received: ${JSON.stringify(req.body)}`);
});

app.get('/admin/dashboard', (req, res) => {
  // This route will only be reached if authMiddleware calls next()
  res.send('Welcome to the Admin Dashboard!');
});

app.get('/admin/settings', (req, res) => {
  // This route also requires auth
  res.send('Admin Settings Page');
});


// --- Router-level Middleware ---
// Router-level middleware works in the same way as application-level middleware,
// except it is bound to an instance of express.Router().
const userRouter = express.Router();

const userSpecificMiddleware = (req, res, next) => {
  console.log(`User-specific middleware for path: ${req.baseUrl}${req.path}`);
  // Example: Check if user ID is numeric for certain user routes
  if (req.params.userId && isNaN(parseInt(req.params.userId))) {
    return res.status(400).send('User ID must be a number.');
  }
  next();
};

// Apply userSpecificMiddleware to all routes in userRouter
userRouter.use(userSpecificMiddleware);

userRouter.get('/', (req, res) => {
  res.send('List of users (requires no specific user ID validation here)');
});

userRouter.get('/:userId', (req, res) => {
  // userSpecificMiddleware already ran and checked if userId is a number if present
  res.send(`Details for user ${req.params.userId}`);
});

app.use('/users', userRouter); // Mount the router

// --- Third-party Middleware: Morgan (for HTTP request logging) ---
// First, install it: `npm install morgan`
const morgan = require('morgan');

// Use morgan for logging. 'dev' is a predefined format string.
// Other formats: 'combined', 'short', 'tiny', etc.
// This will log requests to the console automatically.
// We are adding it here, so it will log requests not handled by previous routes/middleware.
// In a real app, you'd typically place it near the top.
app.use(morgan('dev'));
// Note: Our custom loggerMiddleware also logs requests. In a real app, you'd choose one or the other
// or configure them not to overlap too much. For this example, both will run.


// --- Error-handling Middleware ---
// Error-handling middleware functions are defined in the same way as other
// middleware functions, except they have four arguments instead of three: (err, req, res, next).
// They MUST be defined LAST, after all other app.use() and routes calls.

app.get('/error-test', (req, res, next) => {
  // Simulate an error
  const error = new Error("Something went wrong!");
  error.status = 500; // Optional: add a status code to the error object
  next(error); // Pass the error to the error-handling middleware
});

// This route will throw an error because `someUndefinedFunction` is not defined
app.get('/sync-error', (req, res) => {
  throw new Error('This is a synchronous error!');
});


// Custom Error Handler
// This middleware will catch any errors passed to next(err) or thrown synchronously in route handlers
const errorHandler = (err, req, res, next) => {
  console.error('--- ERROR HANDLER CAUGHT ---');
  console.error('Error Status:', err.status || 500);
  console.error('Error Message:', err.message);
  console.error('Error Stack:', err.stack); // Log the stack trace for debugging
  console.error('--- END ERROR HANDLER ---');

  // Set a default status if not already set on the error object
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode
    }
  });
  // If you were to call next(err) here, it would pass to Express's default error handler
};

app.use(errorHandler); // Add the error handler as the last middleware


app.listen(port, () => {
  console.log(`Middleware example app listening at http://localhost:${port}`);
  console.log('\n--- Test Basic Logging & JSON/URL-encoded Parsing ---');
  console.log(`  GET http://localhost:${port}/`);
  console.log(`  POST to http://localhost:${port}/data with JSON body (e.g., {"name":"test"})`);
  console.log(`    curl -X POST -H "Content-Type: application/json" -d '{"message":"Hello JSON"}' http://localhost:${port}/data`);
  console.log(`  POST to http://localhost:${port}/data with URL-encoded body (e.g., from a form)`);
  console.log(`    curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "name=FormTest&value=123" http://localhost:${port}/data`);

  console.log('\n--- Test Auth Middleware ---');
  console.log('  Access without API key (should be Unauthorized):');
  console.log(`  GET http://localhost:${port}/admin/dashboard`);
  console.log('  Access with correct API key (should be Authorized):');
  console.log(`  GET http://localhost:${port}/admin/dashboard?apiKey=mysecretkey`);

  console.log('\n--- Test Router-Level Middleware & Params ---');
  console.log(`  GET http://localhost:${port}/users/ (lists users)`);
  console.log(`  GET http://localhost:${port}/users/123 (valid user ID)`);
  console.log(`  GET http://localhost:${port}/users/abc (invalid user ID - should give 400 error)`);

  console.log('\n--- Test Error Handling ---');
  console.log('  Trigger a deliberate error handled by error middleware:');
  console.log(`  GET http://localhost:${port}/error-test`);
  console.log('  Trigger a synchronous error:');
  console.log(`  GET http://localhost:${port}/sync-error`);

  console.log('\nNote: Morgan logging will also appear in the console for each request.');
  console.log('To stop the server, press Ctrl+C in the terminal.');
});

/*
How to run this file:
1. Ensure Node.js and npm are installed.
2. In your project directory, run `npm install express morgan`. (Morgan is a third-party middleware for logging)
3. Save this code as `04-middleware.js`.
4. Run from terminal: `node 04-middleware.js`
5. Test the routes as suggested above using your browser or curl.

Example curl commands:
*   POST JSON data:
    curl -X POST -H "Content-Type: application/json" -d '{"name":"Test User","role":"tester"}' http://localhost:3000/data
*   POST Form data:
    curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'name=AnotherTest&value=456' http://localhost:3000/data
*   Access admin route without key:
    curl http://localhost:3000/admin/dashboard
*   Access admin route with key:
    curl "http://localhost:3000/admin/dashboard?apiKey=mysecretkey" (quote URL if using &)
*   Test user routes:
    curl http://localhost:3000/users/
    curl http://localhost:3000/users/101
    curl http://localhost:3000/users/xyz
*   Test error routes:
    curl http://localhost:3000/error-test
    curl http://localhost:3000/sync-error
*/
