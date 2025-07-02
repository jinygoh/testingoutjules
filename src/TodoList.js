// src/TodoList.js
import React from 'react';
import TodoItem from './TodoItem';

function TodoList({ todos, toggleTodo, removeTodo }) {
  if (todos.length === 0) {
    return <p style={{ textAlign: 'center', color: '#777' }}>No todos yet. Add some!</p>;
  }
  return (
    <ul className="todo-list">
      {todos.map((todo) => ( // No need for index here if using todo.id
        <TodoItem
          key={todo.id} // Use the unique todo.id as the key
          todo={todo}
          // Pass lambdas that call the original handlers with todo.id
          toggleTodo={() => toggleTodo(todo.id)}
          removeTodo={() => removeTodo(todo.id)}
        />
      ))}
    </ul>
  );
}

export default TodoList;
