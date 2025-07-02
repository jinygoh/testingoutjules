// src/App.js
import React, { useState, useEffect } from 'react';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import './App.css'; // Import our stylesheet

function App() {
  // Initialize state from localStorage if available, otherwise an empty array
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos);
        return Array.isArray(parsedTodos) ? parsedTodos : [];
      } catch (error) {
        console.error("Error parsing todos from localStorage", error);
        return [];
      }
    } else {
      return [];
    }
  });

  // Persist todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text) => {
    // Create a new todo object. For a real app, use unique IDs (e.g., from a library like uuid)
    const newTodo = { text: text, isCompleted: false, id: Date.now() }; // Using Date.now() as a simple unique ID
    setTodos(prevTodos => [...prevTodos, newTodo]);
  };

  const toggleTodo = (id) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  const removeTodo = (id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  return (
    <div className="app">
      <h1>My To-Do List</h1>
      <TodoForm addTodo={addTodo} />
      <TodoList todos={todos} toggleTodo={toggleTodo} removeTodo={removeTodo} />
    </div>
  );
}

export default App;
