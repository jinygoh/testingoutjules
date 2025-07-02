const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// --- Basic Error Handling & Centralized Error Handler ---

// Simulating an in-memory data store
let items = {
  1: { id: 1, name: 'Item A' },
  2: { id: 2, name: 'Item B' }
};

// Route that might successfully find an item
app.get('/items/:id', (req, res, next) => {
  const itemId = parseInt(req.params.id);
  const item = items[itemId];

  if (item) {
    res.json(item);
  } else {
    // Option 1: Pass a custom error to the error handler
    const error = new Error('Item not found');
    error.status = 404; // Custom property for status code
    next(error); // Pass error to the centralized error handler
  }
});

// Route that intentionally throws a synchronous error
app.get('/sync-error', (req, res, next) => {
  // This error will be caught by Express and passed to the error handler
  throw new Error('This is a synchronous error!');
});

// Route that simulates an error in an asynchronous operation
app.get('/async-error', (req, res, next) => {
  setTimeout(() => {
    try {
      // Simulate an error occurring in an async callback
      throw new Error('This is an asynchronous error!');
    } catch (error) {
      // For errors in async code (callbacks, promises without .catch(next)),
      // you MUST pass them to next() for the Express error handler to catch them.
      next(error);
    }
  }, 100);
});

// Route using promises where errors should be caught and passed to next()
app.get('/promise-error', (req, res, next) => {
  new Promise((resolve, reject) => {
    // Simulate an async operation that might fail
    setTimeout(() => {
      reject(new Error('Error from a promise!'));
    }, 100);
  })
  .then(data => res.send(data)) // This won't be reached in this example
  .catch(next); // Correctly pass the error to Express's error handling
});


// --- Centralized Error-Handling Middleware ---
// This middleware function is defined with four arguments: (err, req, res, next).
// It MUST be the LAST middleware added with app.use().
// Express recognizes it as an error handler because of these four arguments.

function logErrors(err, req, res, next) {
  console.error('--- ERROR LOG ---');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Request Path:', req.path);
  console.error('Request Method:', req.method);
  if (Object.keys(req.body).length > 0) {
    console.error('Request Body:', req.body);
  }
  console.error('Error Message:', err.message);
  console.error('Error Stack:', err.stack); // Full stack trace
  console.error('--- END ERROR LOG ---');
  next(err); // Pass the error to the next error handler
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) { // Check if it was an AJAX request
    res.status(err.status || 500).json({
      error: {
        message: err.message || 'Something failed!',
        status: err.status || 500
      }
    });
  } else {
    // If not an AJAX request, pass to the generic handler
    next(err);
  }
}

function finalErrorHandler(err, req, res, next) {
  // Set a status code based on err.status or default to 500 (Internal Server Error)
  const statusCode = err.status || 500;

  // Send a user-friendly error message
  // In production, you might not want to send the raw err.message for security reasons
  // unless it's a specifically crafted user-facing message.
  res.status(statusCode);
  res.json({
    error: {
      message: err.message || 'An unexpected error occurred.',
      status: statusCode,
      // Optionally, in development, you might include the stack trace
      // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
  // No next(err) here, as this is the final error handler in this chain.
  // If you had more error handlers, you would call next(err).
}

// Register the error-handling middleware
// They are called in the order they are defined.
app.use(logErrors);
app.use(clientErrorHandler); // Example for handling XHR errors differently (optional)
app.use(finalErrorHandler);   // This will be the one sending the response


// Catch-all for routes not defined (404 Not Found)
// This should be placed AFTER all your regular routes and BEFORE error handlers.
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error); // Pass this error to the error handling middleware
});


app.listen(port, () => {
  console.log(`Error Handling example app listening at http://localhost:${port}`);
  console.log('\n--- Test Routes ---');
  console.log('  Successful request:');
  console.log(`  GET http://localhost:${port}/items/1`);
  console.log('  Item not found (404 from route logic):');
  console.log(`  GET http://localhost:${port}/items/99`);
  console.log('  Route not found (404 from catch-all):');
  console.log(`  GET http://localhost:${port}/nonexistent-route`);
  console.log('  Synchronous error:');
  console.log(`  GET http://localhost:${port}/sync-error`);
  console.log('  Asynchronous error (handled with next(error)):');
  console.log(`  GET http://localhost:${port}/async-error`);
  console.log('  Promise rejection (handled with .catch(next)):');
  console.log(`  GET http://localhost:${port}/promise-error`);
  console.log('\nCheck the server console for detailed error logs.');
});

/*
How to run this file:
1. Ensure Node.js and npm are installed.
2. In your project directory, run `npm install express`.
3. Save this code as `09-error-handling.js`.
4. Run from terminal: `node 09-error-handling.js`
5. Test the various routes listed in the console output using your browser or curl.
   Observe both the server console output (for logs from `logErrors`) and the
   JSON response sent to the client (formatted by `finalErrorHandler`).

Example curl commands:
*   Get existing item: `curl http://localhost:3000/items/1`
*   Get non-existing item: `curl -i http://localhost:3000/items/99` (observe 404 status)
*   Access non-existing route: `curl -i http://localhost:3000/foo/bar` (observe 404 status)
*   Trigger synchronous error: `curl -i http://localhost:3000/sync-error` (observe 500 status)
*   Trigger asynchronous error: `curl -i http://localhost:3000/async-error` (observe 500 status)
*   Trigger promise error: `curl -i http://localhost:3000/promise-error` (observe 500 status)
*/
