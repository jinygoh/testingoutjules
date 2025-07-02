# Express.js Crash Course Examples

This repository contains a series of examples demonstrating core concepts of Express.js, designed as a crash course for individuals aiming for entry-level full-stack developer roles.

## Prerequisites

*   **Node.js and npm:** Ensure you have Node.js (which includes npm) installed. You can download it from [nodejs.org](https://nodejs.org/).
    Verify installation:
    ```bash
    node -v
    npm -v
    ```

## Setup

1.  **Clone the repository (or download the files):**
    If this were a Git repository, you'd clone it. For now, ensure all the provided `.js`, `.md`, `.ejs` files, and the `public` directory are in the same main project folder.

2.  **Install dependencies:**
    Navigate to the root directory of this project in your terminal and run:
    ```bash
    npm install
    ```
    This will install Express, EJS, and Morgan, which are used in the examples. A `.gitignore` file is included to exclude `node_modules` from version control.

## Running the Examples

Each JavaScript file (`02-*.js` through `09-*.js`) is a self-contained Express application demonstrating a specific concept.

You can run each example using Node.js from your terminal. Make sure you are in the root directory of the project.

1.  **00-introduction.md & 01-setting-up-environment.md:**
    *   These are markdown files. Read them for conceptual understanding. No code to run directly.

2.  **Hello World (`02-hello-world.js`)**
    *   Run: `npm run start:hello` or `node 02-hello-world.js`
    *   Open your browser and go to `http://localhost:3000`.
    *   See `02-hello-world-explanation.md` for details.

3.  **Routing (`03-routing.js`)**
    *   Run: `npm run start:routing` or `node 03-routing.js`
    *   Test various GET routes in your browser (e.g., `http://localhost:3000/`, `http://localhost:3000/about`, `http://localhost:3000/users/123`).
    *   For POST/PUT/DELETE routes, use a tool like cURL or Postman as described in `03-routing-explanation.md` and the console output.
    *   See `03-routing-explanation.md` for details.

4.  **Middleware (`04-middleware.js`)**
    *   Run: `npm run start:middleware` or `node 04-middleware.js`
    *   Test the various routes as suggested in the console output and `04-middleware-explanation.md`. Pay attention to console logs for middleware activity and use query parameters (e.g., `?apiKey=mysecretkey`) where indicated.
    *   See `04-middleware-explanation.md` for details.

5.  **Request and Response Objects (`05-req-res-objects.js`)**
    *   Run: `npm run start:reqres` or `node 05-req-res-objects.js`
    *   Test the `/inspect-request` and `/response-examples` routes with different query parameters and methods (e.g., POST with JSON body) as detailed in the console output and `05-req-res-objects-explanation.md`.
    *   This example also creates `05-example.html` and `05-example.txt` which are used by `res.sendFile` and `res.download`.
    *   See `05-req-res-objects-explanation.md` for details.

6.  **Serving Static Files (`06-static-files.js`)**
    *   This example requires a `public` directory with `index.html`, `css/style.css`, `js/main.js`, and an image like `images/express-logo.png`. These files are provided.
    *   Run: `npm run start:static` or `node 06-static-files.js`
    *   Open your browser and go to `http://localhost:3000/`. You should see the `index.html` page with its assets loaded.
    *   Try accessing `http://localhost:3000/css/style.css` directly.
    *   See `06-static-files-explanation.md` for details.

7.  **Templating Engines - EJS (`07-templating-ejs.js`)**
    *   This example requires a `views` directory with `index.ejs`. This file is provided.
    *   Run: `npm run start:templating` or `node 07-templating-ejs.js`
    *   Open your browser and go to `http://localhost:3000/`.
    *   You can also create `views/simple.ejs` (as described in the JS file comments) and test `http://localhost:3000/simple`.
    *   See `07-templating-ejs-explanation.md` for details.

8.  **Building a Simple REST API (`08-simple-rest-api.js`)**
    *   Run: `npm run start:api` or `node 08-simple-rest-api.js`
    *   Use a tool like cURL or Postman to interact with the API endpoints (GET, POST, PUT, PATCH, DELETE for `/todos` and `/todos/:id`). Examples are in the console output and `08-simple-rest-api-explanation.md`.
    *   See `08-simple-rest-api-explanation.md` for details.

9.  **Error Handling (`09-error-handling.js`)**
    *   Run: `npm run start:error` or `node 09-error-handling.js`
    *   Test the various error-triggering routes (e.g., `/items/99`, `/nonexistent-route`, `/sync-error`, `/async-error`) as described in the console output and `09-error-handling-explanation.md`. Observe server console logs and client responses.
    *   See `09-error-handling-explanation.md` for details.

10. **Next Steps and Best Practices (`10-next-steps-best-practices.md`)**
    *   This is a markdown file with advice for further learning. No code to run.

## Stopping Servers

To stop any of the running Express servers, go to the terminal window where it's running and press `Ctrl + C`.

## Structure

*   Each `.js` file from `02` to `09` is a runnable Express application.
*   Matching `*-explanation.md` files provide detailed explanations for each concept.
*   The `public/` directory contains static assets for the static files example.
*   The `views/` directory contains EJS templates for the templating example.

This crash course aims to provide a solid foundation. For a real-world application, you would combine these concepts and expand upon them with databases, more robust error handling, security measures, and better project organization. Refer to `10-next-steps-best-practices.md` for guidance on these advanced topics.
Happy Coding!
