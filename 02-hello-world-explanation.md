# Express.js Crash Course: Basic "Hello World" Application

This is the most basic Express application you can create. It starts a server and listens on a specified port for connections. When it receives a GET request to the root URL (`/`), it responds with "Hello World!".

Let's break down the `02-hello-world.js` file:

```javascript
// 1. Import Express
const express = require('express');

// 2. Create an Express application instance
const app = express();

// 3. Define the port the application will run on
const port = process.env.PORT || 3000;

// 4. Define a route handler for GET requests to the root URL ("/")
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 5. Start the server and make it listen for incoming requests
app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
```

## Explanation:

1.  **`const express = require('express');`**
    *   This line imports the Express.js module. The `require()` function is Node.js's built-in way to import modules. You can think of it like `import` statements in other languages.
    *   We assign the imported module to the constant `express`.

2.  **`const app = express();`**
    *   This line creates an instance of an Express application. The `express()` function is a top-level function exported by the Express module.
    *   The `app` object conventionally denotes the Express application. This object has methods for routing HTTP requests, configuring middleware, rendering HTML views, registering a template engine, and modifying application settings that control how the application behaves (e.g. the environment mode, router case sensitivity, etc.).

3.  **`const port = process.env.PORT || 3000;`**
    *   This line defines the port number on which the server will listen for incoming requests.
    *   `process.env.PORT`: In many hosting environments (like Heroku, AWS, etc.), the port number is dynamically assigned by the environment and stored in an environment variable called `PORT`. This line checks if `PORT` is set in the environment variables.
    *   `|| 3000`: If `process.env.PORT` is not set (e.g., when you're running it locally for development), it defaults to port `3000`.

4.  **`app.get('/', (req, res) => { ... });`**
    *   This is a **route definition**. It tells the server how to respond to a specific kind of request.
    *   `app.get()`: This method is used to define a handler for HTTP GET requests. Express has similar methods for other HTTP verbs like `app.post()`, `app.put()`, `app.delete()`, etc.
    *   `'/'`: This is the **path** (or route) for which this handler is defined. In this case, it's the root path of your application (e.g., `http://localhost:3000/`).
    *   `(req, res) => { ... }`: This is the **handler function** (also called a callback function). It's executed whenever the server receives a GET request to the specified path (`/`).
        *   `req` (Request): An object containing information about the incoming HTTP request (e.g., headers, query parameters, URL, etc.).
        *   `res` (Response): An object used to send a response back to the client.
        *   `res.send('Hello World!');`: This line uses the `send()` method of the response object to send the string "Hello World!" back to the client that made the request. Express sets the `Content-Type` header to `text/html` by default for strings.

5.  **`app.listen(port, () => { ... });`**
    *   This method starts the HTTP server and makes it listen for connections on the specified `port`.
    *   The second argument is a callback function that is executed once the server has successfully started.
    *   `console.log(...)`: This logs a message to the console indicating that the server is running and on which port it's listening. This is helpful for development.

## How to Run This Example:

1.  **Save the code:** Save the code above into a file named `02-hello-world.js` (or similar).
2.  **Ensure dependencies:**
    *   Make sure you are in your project directory (e.g., `my-express-app`) in your terminal.
    *   If you haven't already, run `npm init -y` to create a `package.json`.
    *   Install Express: `npm install express`.
3.  **Run the server:** Open your terminal, navigate to the directory where you saved the file, and execute:
    ```bash
    node 02-hello-world.js
    ```
4.  **Access in browser:** You should see the message `Express server listening at http://localhost:3000` in your terminal. Now, open your web browser and go to `http://localhost:3000`.
5.  **See the result:** The browser should display the text "Hello World!".
6.  **Stop the server:** To stop the server, go back to your terminal and press `Ctrl + C`.

This simple "Hello World" application demonstrates the fundamental structure of an Express app: initializing Express, defining a route, and starting the server.
