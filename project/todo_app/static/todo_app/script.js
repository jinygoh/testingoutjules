// This JavaScript file handles the frontend logic for the To-Do application.
// It communicates with the Django Rest Framework API (defined in todo_app/views.py and urls.py)
// to fetch, create, update, and delete to-do items.
// It also dynamically updates the HTML (index.html) to reflect these changes.

// Wait for the HTML Document Object Model (DOM) to be fully loaded before running the script.
document.addEventListener('DOMContentLoaded', function() {

    // Get references to key HTML elements.
    const todoList = document.getElementById('todo-list'); // The <ul> element to display todos.
    const addTodoForm = document.getElementById('add-todo-form'); // The form for adding new todos.
    const newTodoTitleInput = document.getElementById('new-todo-title'); // The input field for the new todo title.

    // Define the base URL for the API.
    // This corresponds to the DRF router prefix in todo_app/urls.py.
    const apiUrl = '/api/todos/';

    // Function to fetch todo items from the API and display them.
    async function fetchTodos() {
        try {
            // Make a GET request to the API.
            const response = await fetch(apiUrl);
            if (!response.ok) {
                // If the response is not successful, throw an error.
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Parse the JSON response into an array of todo items.
            const todos = await response.json();
            // Clear the current list in the HTML.
            todoList.innerHTML = '';
            // For each todo item, create an HTML list item and add it to the list.
            todos.forEach(todo => {
                renderTodoItem(todo);
            });
        } catch (error) {
            // Log any errors to the console.
            console.error("Could not fetch todos:", error);
            todoList.innerHTML = '<li>Error loading todos. Please try again later.</li>';
        }
    }

    // Function to create an HTML list item for a single todo object.
    function renderTodoItem(todo) {
        // Create a new list item element (<li>).
        const item = document.createElement('li');
        item.classList.add('todo-item'); // Add a class for styling.
        item.dataset.id = todo.id; // Store the todo's ID in a data attribute for later access.

        // If the todo is completed, add a 'completed' class for styling.
        if (todo.completed) {
            item.classList.add('completed');
        }

        // Create a <span> to display the todo title.
        const titleSpan = document.createElement('span');
        titleSpan.textContent = todo.title;

        // Create a <div> to hold the action buttons.
        const buttonsDiv = document.createElement('div');

        // Create a "Complete" / "Undo" button.
        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-btn');
        completeButton.textContent = todo.completed ? 'Undo' : 'Complete';
        // Add an event listener to handle clicks on the complete button.
        completeButton.addEventListener('click', () => toggleComplete(todo));

        // Create a "Delete" button.
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.textContent = 'Delete';
        // Add an event listener to handle clicks on the delete button.
        deleteButton.addEventListener('click', () => deleteTodo(todo.id));

        // Append the title and buttons to the list item.
        buttonsDiv.appendChild(completeButton);
        buttonsDiv.appendChild(deleteButton);
        item.appendChild(titleSpan);
        item.appendChild(buttonsDiv);

        // Append the list item to the main todo list in the HTML.
        todoList.appendChild(item);
    }

    // Function to handle adding a new todo item.
    async function addTodo(event) {
        event.preventDefault(); // Prevent the default form submission behavior (page reload).

        // Get the title from the input field and trim whitespace.
        const title = newTodoTitleInput.value.trim();
        if (!title) return; // If the title is empty, do nothing.

        try {
            // Make a POST request to the API to create the new todo.
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Django's CSRF protection requires a CSRF token for POST requests.
                    // This helper function retrieves the token from cookies.
                    'X-CSRFToken': getCookie('csrftoken')
                },
                // Convert the new todo data to a JSON string for the request body.
                body: JSON.stringify({ title: title, completed: false })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Parse the created todo item from the response.
            const newTodo = await response.json();
            // Add the new todo item to the displayed list.
            renderTodoItem(newTodo);
            // Clear the input field.
            newTodoTitleInput.value = '';
        } catch (error) {
            console.error("Could not add todo:", error);
            alert("Error adding todo. Please check the console for details.");
        }
    }

    // Function to toggle the completed status of a todo item.
    async function toggleComplete(todo) {
        try {
            // Make a PUT request to the API to update the todo item.
            // We send the opposite of its current 'completed' status.
            const response = await fetch(`${apiUrl}${todo.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    title: todo.title, // Keep the title the same
                    completed: !todo.completed // Toggle the completed status
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Fetch and re-render all todos to reflect the change.
            // A more optimized approach might be to update only the changed item in the DOM.
            fetchTodos();
        } catch (error) {
            console.error("Could not update todo:", error);
            alert("Error updating todo. Please check the console for details.");
        }
    }

    // Function to delete a todo item.
    async function deleteTodo(todoId) {
        // Confirm before deleting.
        if (!confirm("Are you sure you want to delete this task?")) {
            return;
        }

        try {
            // Make a DELETE request to the API.
            const response = await fetch(`${apiUrl}${todoId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            if (!response.ok && response.status !== 204) { // 204 No Content is a success for DELETE
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Fetch and re-render all todos to reflect the deletion.
            // A more optimized approach might be to remove the specific item from the DOM.
            fetchTodos();
        } catch (error) {
            console.error("Could not delete todo:", error);
            alert("Error deleting todo. Please check the console for details.");
        }
    }

    // Helper function to get CSRF token from cookies (required by Django for POST/PUT/DELETE).
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Add event listener for the form submission.
    if (addTodoForm) {
        addTodoForm.addEventListener('submit', addTodo);
    }

    // Initial fetch of todos when the page loads.
    fetchTodos();
});
