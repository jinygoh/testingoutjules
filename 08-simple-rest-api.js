const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// In-memory "database" for simplicity
let todos = [
  { id: 1, task: 'Learn Express.js', completed: false, createdAt: new Date() },
  { id: 2, task: 'Build a REST API', completed: false, createdAt: new Date() },
  { id: 3, task: 'Deploy the application', completed: false, createdAt: new Date() }
];
let nextId = 4; // To simulate auto-incrementing ID

// --- REST API Endpoints for Todos ---

// GET /todos - Retrieve all todos
app.get('/todos', (req, res) => {
  res.status(200).json(todos);
});

// GET /todos/:id - Retrieve a single todo by ID
app.get('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  const todo = todos.find(t => t.id === todoId);

  if (todo) {
    res.status(200).json(todo);
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

// POST /todos - Create a new todo
app.post('/todos', (req, res) => {
  const { task, completed = false } = req.body;

  if (!task || typeof task !== 'string' || task.trim() === '') {
    return res.status(400).json({ message: 'Task is required and must be a non-empty string.' });
  }
  if (typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'Completed must be a boolean.' });
  }

  const newTodo = {
    id: nextId++,
    task: task.trim(),
    completed: completed,
    createdAt: new Date()
  };
  todos.push(newTodo);
  res.status(201).json(newTodo); // 201 Created
});

// PUT /todos/:id - Update an existing todo
app.put('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  const { task, completed } = req.body;

  const todoIndex = todos.findIndex(t => t.id === todoId);

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  // Validate inputs if provided
  if (task !== undefined) {
    if (typeof task !== 'string' || task.trim() === '') {
      return res.status(400).json({ message: 'Task must be a non-empty string.' });
    }
    todos[todoIndex].task = task.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Completed must be a boolean.' });
    }
    todos[todoIndex].completed = completed;
  }

  todos[todoIndex].updatedAt = new Date(); // Add an updated timestamp

  res.status(200).json(todos[todoIndex]);
});

// PATCH /todos/:id - Partially update an existing todo
// Similar to PUT, but only updates fields that are provided.
app.patch('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  const updates = req.body; // e.g., { task: "New task name" } or { completed: true }

  const todoIndex = todos.findIndex(t => t.id === todoId);

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  // Update only provided fields
  if (updates.task !== undefined) {
    if (typeof updates.task !== 'string' || updates.task.trim() === '') {
      return res.status(400).json({ message: 'Task must be a non-empty string.' });
    }
    todos[todoIndex].task = updates.task.trim();
  }

  if (updates.completed !== undefined) {
    if (typeof updates.completed !== 'boolean') {
      return res.status(400).json({ message: 'Completed must be a boolean.' });
    }
    todos[todoIndex].completed = updates.completed;
  }

  todos[todoIndex].updatedAt = new Date();

  res.status(200).json(todos[todoIndex]);
});

// DELETE /todos/:id - Delete a todo
app.delete('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  const initialLength = todos.length;
  todos = todos.filter(t => t.id !== todoId);

  if (todos.length < initialLength) {
    res.status(204).send(); // 204 No Content (successful deletion)
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});


app.listen(port, () => {
  console.log(`Simple REST API server listening at http://localhost:${port}`);
  console.log('Available Todo API endpoints:');
  console.log('  GET    /todos         - Get all todos');
  console.log('  GET    /todos/:id     - Get a single todo by ID');
  console.log('  POST   /todos         - Create a new todo (Content-Type: application/json)');
  console.log('  PUT    /todos/:id     - Update a todo (Content-Type: application/json)');
  console.log('  PATCH  /todos/:id     - Partially update a todo (Content-Type: application/json)');
  console.log('  DELETE /todos/:id     - Delete a todo');
  console.log('\nUse a tool like Postman or curl to test these endpoints.');
  console.log('\nExample curl commands:');
  console.log('  Get all: curl http://localhost:3000/todos');
  console.log('  Get one: curl http://localhost:3000/todos/1');
  console.log('  Create:  curl -X POST -H "Content-Type: application/json" -d \'{"task":"Buy groceries"}\' http://localhost:3000/todos');
  console.log('  Update:  curl -X PUT -H "Content-Type: application/json" -d \'{"task":"Buy organic groceries", "completed":false}\' http://localhost:3000/todos/1');
  console.log('  Patch:   curl -X PATCH -H "Content-Type: application/json" -d \'{"completed":true}\' http://localhost:3000/todos/1');
  console.log('  Delete:  curl -X DELETE http://localhost:3000/todos/1');
});

/*
How to run this file:
1. Ensure Node.js and npm are installed.
2. In your project directory, run `npm install express`.
3. Save this code as `08-simple-rest-api.js`.
4. Run from terminal: `node 08-simple-rest-api.js`
5. Use a tool like Postman, Insomnia, or curl to interact with the API endpoints.
   - GET /todos
   - GET /todos/1
   - POST /todos (Body: {"task": "New Task Title"})
   - PUT /todos/1 (Body: {"task": "Updated Task Title", "completed": true})
   - PATCH /todos/1 (Body: {"completed": false})
   - DELETE /todos/1
*/
