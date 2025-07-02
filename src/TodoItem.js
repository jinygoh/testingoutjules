// src/TodoItem.js
import React from 'react';

// `toggleTodo` and `removeTodo` are now functions that are pre-configured with the ID
// (e.g., `() => originalToggleTodo(todo.id)`) from TodoList
function TodoItem({ todo, toggleTodo, removeTodo }) {
  return (
    <li className="todo-item">
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={toggleTodo} // Directly call the passed function
      />
      <span
        onClick={toggleTodo} // Also allow toggling by clicking text
        className={todo.isCompleted ? 'completed' : ''}
      >
        {todo.text}
      </span>
      <button onClick={removeTodo}>Remove</button> {/* Directly call the passed function */}
    </li>
  );
}

export default TodoItem;
