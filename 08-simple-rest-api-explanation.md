# Express.js Crash Course: Building a Simple REST API

A REST (Representational State Transfer) API is a common architectural style for designing networked applications. It uses standard HTTP methods (GET, POST, PUT, PATCH, DELETE) to perform operations on resources, which are identified by URLs.

The `08-simple-rest-api.js` file demonstrates how to build a basic REST API for managing a list of "todos" using Express.js. For simplicity, it uses an in-memory array as a database.

## Key Concepts in a REST API:

*   **Resources:** The core concept in REST. In our example, a "todo" item is a resource. Each resource has a unique identifier (e.g., `/todos/1`).
*   **HTTP Methods (Verbs):**
    *   `GET`: Retrieve a resource or a collection of resources.
    *   `POST`: Create a new resource.
    *   `PUT`: Update an existing resource (replaces the entire resource).
    *   `PATCH`: Partially update an existing resource (modifies only specified fields).
    *   `DELETE`: Remove a resource.
*   **Endpoints (URIs):** The URLs that map to resources (e.g., `/todos`, `/todos/:id`).
*   **Representations:** Resources are typically represented in formats like JSON or XML. Our API uses JSON.
*   **Statelessness:** Each request from a client to the server must contain all the information needed to understand and process the request. The server does not store any client context between requests.
*   **HTTP Status Codes:** Standard codes are used to indicate the outcome of an API request (e.g., `200 OK`, `201 Created`, `404 Not Found`, `400 Bad Request`, `500 Internal Server Error`).

## Breakdown of `08-simple-rest-api.js`:

1.  **Setup:**
    ```javascript
    const express = require('express');
    const app = express();
    const port = 3000;

    // Middleware to parse JSON request bodies
    app.use(express.json());
    ```
    *   Imports Express and initializes an app instance.
    *   `app.use(express.json());` is crucial middleware that parses incoming JSON payloads and makes them available in `req.body`.

2.  **In-Memory Data Store:**
    ```javascript
    let todos = [
      { id: 1, task: 'Learn Express.js', completed: false, createdAt: new Date() },
      // ... more initial todos
    ];
    let nextId = 4; // Simple ID generator
    ```
    *   For this example, we use a simple JavaScript array `todos` to store our data. In a real application, this would typically be a database (like MongoDB, PostgreSQL, etc.).
    *   `nextId` is used to simulate auto-incrementing IDs for new todos.

3.  **API Endpoints (Routes):**

    *   **`GET /todos` - Retrieve all todos:**
        ```javascript
        app.get('/todos', (req, res) => {
          res.status(200).json(todos);
        });
        ```
        *   Responds with a `200 OK` status and the entire `todos` array as JSON.

    *   **`GET /todos/:id` - Retrieve a single todo by ID:**
        ```javascript
        app.get('/todos/:id', (req, res) => {
          const todoId = parseInt(req.params.id);
          const todo = todos.find(t => t.id === todoId);
          if (todo) {
            res.status(200).json(todo);
          } else {
            res.status(404).json({ message: 'Todo not found' });
          }
        });
        ```
        *   Uses a route parameter `:id` to capture the todo's ID from the URL.
        *   `parseInt(req.params.id)` converts the ID from a string to a number.
        *   `todos.find()` searches for the todo.
        *   Responds with `200 OK` and the todo if found, or `404 Not Found` if not.

    *   **`POST /todos` - Create a new todo:**
        ```javascript
        app.post('/todos', (req, res) => {
          const { task, completed = false } = req.body;
          // ... validation ...
          const newTodo = { id: nextId++, task: task.trim(), completed, createdAt: new Date() };
          todos.push(newTodo);
          res.status(201).json(newTodo);
        });
        ```
        *   Expects a JSON payload in `req.body` with a `task` property (and optionally `completed`).
        *   Includes basic validation for the `task` and `completed` fields.
        *   Creates a new todo object, assigns a new ID, and adds it to the `todos` array.
        *   Responds with `201 Created` and the newly created todo object.

    *   **`PUT /todos/:id` - Update an existing todo:**
        ```javascript
        app.put('/todos/:id', (req, res) => {
          const todoId = parseInt(req.params.id);
          const { task, completed } = req.body;
          const todoIndex = todos.findIndex(t => t.id === todoId);
          // ... validation and update logic ...
          if (todoIndex === -1) { /* ... 404 ... */ }
          // ... update fields ...
          todos[todoIndex].updatedAt = new Date();
          res.status(200).json(todos[todoIndex]);
        });
        ```
        *   Updates an entire existing resource. If the resource doesn't exist, it might create it (though this example returns 404).
        *   Finds the todo by ID, updates its properties based on `req.body`.
        *   Includes validation for incoming data.
        *   Responds with `200 OK` and the updated todo.

    *   **`PATCH /todos/:id` - Partially update an existing todo:**
        ```javascript
        app.patch('/todos/:id', (req, res) => {
          // ... similar to PUT, but only updates fields present in req.body ...
        });
        ```
        *   Similar to `PUT`, but designed to apply partial updates. Only the fields provided in `req.body` are modified.
        *   Finds the todo, applies changes from `req.body` to the found todo.
        *   Responds with `200 OK` and the updated todo.

    *   **`DELETE /todos/:id` - Delete a todo:**
        ```javascript
        app.delete('/todos/:id', (req, res) => {
          const todoId = parseInt(req.params.id);
          const initialLength = todos.length;
          todos = todos.filter(t => t.id !== todoId);
          if (todos.length < initialLength) {
            res.status(204).send(); // 204 No Content
          } else {
            res.status(404).json({ message: 'Todo not found' });
          }
        });
        ```
        *   Removes the todo with the specified ID from the `todos` array.
        *   Responds with `204 No Content` on successful deletion (as there's no content to return).
        *   Responds with `404 Not Found` if the todo doesn't exist.

4.  **Starting the Server:**
    ```javascript
    app.listen(port, () => {
      console.log(`Simple REST API server listening at http://localhost:${port}`);
      // ... console logs for testing ...
    });
    ```
    *   Starts the server and provides instructions on how to test the API endpoints, typically using tools like `curl` or Postman.

## Testing the API

Since many API endpoints involve methods other than GET (like POST, PUT, DELETE) and require sending data in the request body, a browser is often not sufficient for testing. Tools like:

*   **cURL:** A command-line tool for transferring data with URLs.
*   **Postman:** A popular GUI application for API development and testing.
*   **Insomnia:** Another excellent GUI API client.
*   **VS Code Extensions:** Such as "REST Client" or "Thunder Client".

The example code includes `curl` commands to test each endpoint. For instance, to create a new todo:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"task":"Buy groceries"}' http://localhost:3000/todos
```

This simple REST API covers the fundamental CRUD (Create, Read, Update, Delete) operations and is a good starting point for understanding how to build APIs with Express.js. In a real-world application, you would replace the in-memory array with a persistent database and add more robust error handling, validation, authentication, and authorization.
