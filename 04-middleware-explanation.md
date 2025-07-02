# Express.js Crash Course: Middleware

Middleware functions are a cornerstone of Express.js. They are functions that have access to the request object (`req`), the response object (`res`), and the `next` function in the application's request-response cycle. The `next` function is a function in the Express router which, when invoked, executes the middleware succeeding the current middleware.

## Key Characteristics of Middleware:

*   **Execute any code:** Perform logging, modify request/response objects, interact with databases, etc.
*   **Access `req` and `res`:** Read data from the request (headers, body, params) and manipulate the response (set headers, send data).
*   **End the cycle:** A middleware can choose to send a response to the client, thereby ending the request-response cycle (e.g., `res.send()`, `res.json()`, `res.status().send()`).
*   **Call `next()`:** If a middleware doesn't end the cycle, it *must* call `next()` to pass control to the next middleware function in the stack. If it doesn't, the request will be left "hanging," and the client will eventually time out.
    *   `next()`: Passes control to the next middleware in line.
    *   `next('route')`: Skips the remaining middleware functions for the current route and passes control to the next matching route.
    *   `next(error)`: Passes an error to the error-handling middleware.

## Types of Middleware (and how they are used in `04-middleware.js`):

1.  **Application-level Middleware:**
    *   Bound to an instance of the app object by using `app.use()` or `app.METHOD()`.
    *   Can be applied to all requests or to specific paths.
    *   **Example (`04-middleware.js`):**
        *   `loggerMiddleware`: A custom middleware that logs details of each incoming request. It's applied to all routes using `app.use(loggerMiddleware)`.
        *   `express.json()`: Built-in middleware to parse incoming requests with JSON payloads. Populates `req.body`.
        *   `express.urlencoded({ extended: true })`: Built-in middleware to parse incoming requests with URL-encoded payloads (e.g., from HTML form submissions). Populates `req.body`.
        *   `authMiddleware`: A custom middleware that checks for an `apiKey` in the query string. It's applied only to routes starting with `/admin` using `app.use('/admin', authMiddleware)`. If auth fails, it sends a 401 response and *does not* call `next()`.

2.  **Router-level Middleware:**
    *   Works the same way as application-level middleware, but it is bound to an instance of `express.Router()`.
    *   Useful for restricting middleware to a specific group of routes.
    *   **Example (`04-middleware.js`):**
        *   `userSpecificMiddleware`: Applied to all routes defined within `userRouter` using `userRouter.use(userSpecificMiddleware)`. It performs a validation check on `req.params.userId`.
        *   The `userRouter` is then mounted on the `/users` path in the main app: `app.use('/users', userRouter)`.

3.  **Built-in Middleware:**
    *   Express comes with a few built-in middleware functions, such as:
        *   `express.json()`: Parses JSON request bodies.
        *   `express.urlencoded()`: Parses URL-encoded request bodies.
        *   `express.static()`: Serves static files (covered in a later section).
        *   `express.Router()`: Though not middleware itself, it allows for modular middleware stacks.

4.  **Third-party Middleware:**
    *   Installed via npm (e.g., `npm install <package-name>`).
    *   Provides a wide range of functionalities like logging, security, compression, session management, etc.
    *   **Example (`04-middleware.js`):**
        *   `morgan`: An HTTP request logger. Installed via `npm install morgan` and used as `app.use(morgan('dev'))`. The `'dev'` argument specifies a predefined logging format.

5.  **Error-handling Middleware:**
    *   These middleware functions are special because they are defined with **four arguments** instead of three: `(err, req, res, next)`.
    *   They **must be defined last**, after all other `app.use()` calls and route definitions.
    *   They are called when:
        *   A preceding middleware calls `next(err)`.
        *   An error is thrown synchronously within a route handler or other middleware. (Note: Asynchronous errors need to be caught and passed to `next()` explicitly, e.g., in promise `.catch(next)`).
    *   **Example (`04-middleware.js`):**
        *   `errorHandler`: A custom error-handling middleware. It logs the error details and sends a structured JSON response to the client.
        *   The routes `/error-test` (calls `next(new Error(...))`) and `/sync-error` (throws an error directly) demonstrate how errors are caught by this handler.

## Order of Middleware Matters!

Middleware functions are executed sequentially in the order they are defined.

*   Middleware defined earlier will run before middleware defined later.
*   If `express.json()` is not defined before a route that expects a JSON body, `req.body` will be `undefined`.
*   Error-handling middleware must be defined last to catch errors from all preceding routes and middleware.
*   General middleware (like loggers) are often placed at the top. More specific middleware (like authentication for certain routes) is placed before the routes it protects.

## How to Test (`04-middleware.js`):

The comments at the bottom of `04-middleware.js` and the console output when the server starts provide various `curl` commands and URLs to test the different middleware functionalities:

*   **Logging:** Observe the console output for logs from `loggerMiddleware` and `morgan`.
*   **Body Parsing:** Use `curl` to send POST requests with JSON and URL-encoded data to `/data`.
*   **Authentication:**
    *   Access `/admin/dashboard` without `?apiKey=mysecretkey` (expect 401 Unauthorized).
    *   Access `/admin/dashboard?apiKey=mysecretkey` (expect success).
*   **Router-level & Param Validation:**
    *   Access `/users/123` (valid).
    *   Access `/users/abc` (expect 400 Bad Request due to `userSpecificMiddleware`).
*   **Error Handling:**
    *   Access `/error-test` to see `errorHandler` catch an error passed via `next(err)`.
    *   Access `/sync-error` to see `errorHandler` catch a synchronously thrown error.

Middleware is a powerful concept that provides Express with its flexibility and extensibility. Understanding how to write and use middleware is key to building robust and feature-rich Express applications.
