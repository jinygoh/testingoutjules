# Express.js Crash Course: Working with Request and Response Objects

In Express.js, every route handler function receives two primary objects as arguments: the Request object (usually named `req`) and the Response object (usually named `res`). These objects are crucial for interacting with incoming client requests and sending back appropriate responses.

The `05-req-res-objects.js` file demonstrates various properties and methods of these objects.

## The Request (`req`) Object

The `req` object represents the HTTP request made by the client. It contains a wealth of information about the incoming request. Express adds helpful properties and methods to the basic Node.js request object.

**Key `req` properties and methods demonstrated:**

*   **`req.method`**: A string indicating the HTTP method of the request (e.g., `'GET'`, `'POST'`, `'PUT'`).
*   **`req.url`**: The full URL as requested by the client, including the path and query string (e.g., `/search?query=express&page=1`).
*   **`req.path`**: The path part of the request URL (e.g., `/search`).
*   **`req.query`**: An object containing the parsed query string parameters. For a URL like `/search?name=John&age=30`, `req.query` would be `{ name: 'John', age: '30' }`.
*   **`req.params`**: An object containing properties mapped to the named route "parameters". If you have a route like `/users/:userId`, and the request is to `/users/123`, then `req.params` would be `{ userId: '123' }`.
*   **`req.headers`**: An object containing the HTTP request headers sent by the client (e.g., `User-Agent`, `Content-Type`, `Authorization`). Property names are lowercase.
*   **`req.get(headerName)`**: A convenient, case-insensitive method to retrieve a specific request header value (e.g., `req.get('Content-Type')`).
*   **`req.body`**: An object containing the parsed request body. **Important:** To populate `req.body`, you *must* use body-parsing middleware like `express.json()` (for JSON bodies) or `express.urlencoded()` (for URL-encoded form data). Without this middleware, `req.body` will be `undefined`.
*   **`req.ip`**: The remote IP address of the client.
*   **`req.protocol`**: The request protocol string, either `'http'` or `'https'` (for TLS/SSL requests).
*   **`req.cookies`**: An object containing cookies sent by the request. Requires `cookie-parser` middleware to be populated. (Not explicitly used in the `req` section of the example but related to `res.cookie`).

The `/inspect-request` route in the example file logs many of these properties to the server console and sends some back in the response.

## The Response (`res`) Object

The `res` object represents the HTTP response that your Express application sends back to the client. You use methods on this object to construct and send the response. Express enhances the basic Node.js response object with helpful methods.

**Key `res` methods demonstrated:**

*   **`res.send([body])`**:
    *   A versatile method that can send various types of responses: strings (HTML), objects/arrays (JSON), or `Buffer` objects.
    *   Automatically sets the `Content-Type` header based on the data type (e.g., `text/html` for strings, `application/json` for objects/arrays).
    *   Ends the request-response cycle.

*   **`res.json([body])`**:
    *   Specifically sends a JSON response.
    *   Converts the argument to a JSON string using `JSON.stringify()`.
    *   Sets the `Content-Type` header to `application/json`.
    *   Ends the request-response cycle.

*   **`res.status(code)`**:
    *   Sets the HTTP status code for the response (e.g., `200`, `404`, `500`).
    *   Returns the `res` object, so it's often chained with other response methods like `res.status(201).json({ message: 'Created' })`.

*   **`res.sendStatus(statusCode)`**:
    *   Sets the HTTP status code and sends the standard text representation of that status code as the response body (e.g., `res.sendStatus(403)` sends the string "Forbidden").
    *   This method *ends* the request-response cycle by itself; you should not chain it with `send()` or `json()`.

*   **`res.redirect([status,] path)`**:
    *   Redirects the client to a different URL.
    *   The `status` argument is optional and defaults to `302` (Found).
    *   The `path` can be a full URL or a path within your application.
    *   Example: `res.redirect('/login')` or `res.redirect(301, 'http://example.com')`.

*   **`res.sendFile(path [, options] [, callback])`**:
    *   Transfers the file at the given `path` as the response.
    *   Sets the `Content-Type` header based on the file's extension.
    *   The `path` must be an absolute path to the file, or you must specify the `root` option. It's good practice to use `path.join(__dirname, 'filename')` to create absolute paths safely.
    *   The optional callback function is called when the transfer is complete or if an error occurs.

*   **`res.download(path [, filename] [, options] [, callback])`**:
    *   Prompts the client to download the file specified by `path`.
    *   Sets the `Content-Disposition` header to `attachment`, usually triggering a "Save As" dialog in the browser.
    *   The optional `filename` argument specifies the name the file should have when downloaded.
    *   The optional callback is called upon completion or error.

*   **`res.set(field, [value])` or `res.header(field, [value])`**:
    *   Sets one or more HTTP response headers.
    *   `res.set('Content-Type', 'text/plain')`
    *   `res.set({ 'X-Custom-Header': 'SomeValue', 'Cache-Control': 'no-store' })`

*   **`res.cookie(name, value [, options])`**:
    *   Sets a cookie with the given `name` and `value`.
    *   The `options` object can specify attributes like `maxAge`, `expires`, `httpOnly`, `secure`, `path`, `domain`, `sameSite`.
    *   Example: `res.cookie('sessionToken', 'xyz123', { httpOnly: true, maxAge: 3600000 })`.

The `/response-examples` route in the example file demonstrates these methods based on a query parameter (`?type=...`).

## Important Considerations:

*   **Ending the Response:** Most `res` methods that send data (like `res.send()`, `res.json()`, `res.sendFile()`, `res.sendStatus()`, `res.redirect()`) also end the request-response cycle. You should only call one of these methods per request. Calling multiple will result in an error.
*   **Middleware for `req.body`:** Remember that `req.body` is only populated if you use appropriate body-parsing middleware (e.g., `app.use(express.json())`).
*   **Asynchronous Operations:** If your route handler involves asynchronous operations (like reading a file or querying a database), ensure you only send a response *after* the asynchronous operation is complete (usually within its callback or promise handler).

Understanding and effectively using the `req` and `res` objects is fundamental to building any web application or API with Express.js. They are your primary tools for handling client interactions. The example file `05-req-res-objects.js` provides practical demonstrations that you can run and experiment with.
