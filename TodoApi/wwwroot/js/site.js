// TodoApi/wwwroot/js/site.js
// This file contains the JavaScript client-side logic for interacting with the Todo API.
// Responsibilities:
// 1. Fetching and displaying the list of To-do items from the API.
// 2. Handling user input to add new To-do items.
// 3. Handling user input to update existing To-do items.
// 4. Handling user input to delete To-do items.
// It manipulates the DOM of index.html to reflect changes and provide interactivity.

const uri = 'api/todo'; // Base URI for the Todo API endpoint.
let todos = []; // Local cache of To-do items.

// Function: getTodos
// Purpose: Fetches all To-do items from the API and updates the UI.
function getTodos() {
    fetch(uri) // Sends a GET request to the API (e.g., /api/todo).
        .then(response => {
            if (!response.ok) {
                // If the response status is not OK (e.g., 404, 500), throw an error.
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parses the JSON response body.
        })
        .then(data => {
            // On successful data retrieval:
            todos = data; // Update the local cache.
            _displayItems(data); // Call the function to update the UI.
        })
        .catch(error => console.error('Unable to get items.', error)); // Logs errors to the console.
}

// Function: addTodo
// Purpose: Adds a new To-do item using data from the "add" form.
function addTodo() {
    // Get references to the input elements in the "add" form.
    const addNameTextbox = document.getElementById('add-name');
    const addIsCompleteCheckbox = document.getElementById('add-isComplete');

    // Create a new To-do item object from the form inputs.
    const item = {
        isComplete: addIsCompleteCheckbox.checked, // Boolean: whether the item is complete.
        name: addNameTextbox.value.trim() // String: name of the item, with whitespace trimmed.
    };

    // Send a POST request to the API to create the new item.
    fetch(uri, {
        method: 'POST', // HTTP method.
        headers: {
            'Accept': 'application/json', // Indicates the client expects JSON.
            'Content-Type': 'application/json' // Indicates the request body is JSON.
        },
        body: JSON.stringify(item) // Convert the item object to a JSON string for the request body.
    })
    .then(response => {
        if (!response.ok) {
            // If the response is not OK, check for specific status codes or throw a generic error.
            if (response.status === 400) { // Bad Request, often due to validation errors
                response.json().then(errors => { // Try to parse validation errors from response
                    console.error('Validation errors:', errors);
                    alert('Failed to add item. Please check your input. (e.g., Name is required)');
                });
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return null; // Return null to stop further .then() processing for this path
        }
        return response.json(); // Parse the JSON response (the newly created item).
    })
    .then(newItem => {
        if (newItem) { // If newItem is not null (i.e., request was successful)
            getTodos(); // Refresh the displayed list of items.
            addNameTextbox.value = ''; // Clear the name input field.
            addIsCompleteCheckbox.checked = false; // Reset the checkbox.
        }
    })
    .catch(error => console.error('Unable to add item.', error)); // Logs errors.
}

// Function: deleteTodo
// Purpose: Deletes a To-do item by its ID.
function deleteTodo(id) {
    // Send a DELETE request to the API for the specific item.
    fetch(`${uri}/${id}`, { // URI includes the item's ID (e.g., /api/todo/5).
        method: 'DELETE' // HTTP method.
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // No response body is expected for a successful DELETE, so no response.json()
        getTodos(); // Refresh the displayed list.
    })
    .catch(error => console.error('Unable to delete item.', error)); // Logs errors.
}

// Function: displayEditForm
// Purpose: Shows the edit form and populates it with the data of the item to be edited.
function displayEditForm(id) {
    // Find the item to edit from the local cache.
    const item = todos.find(item => item.id === id);
    if (!item) {
        console.error(`Item with id ${id} not found for editing.`);
        return;
    }

    // Populate the edit form fields with the item's data.
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-isComplete').checked = item.isComplete;
    document.getElementById('editForm').style.display = 'block'; // Make the edit form visible.
}

// Function: updateTodo
// Purpose: Submits the updated To-do item data from the edit form to the API.
function updateTodo() {
    // Get the item's ID from the hidden input field in the edit form.
    const itemId = document.getElementById('edit-id').value;

    // Create an updated item object from the edit form inputs.
    const item = {
        id: parseInt(itemId, 10), // Ensure ID is an integer.
        name: document.getElementById('edit-name').value.trim(),
        isComplete: document.getElementById('edit-isComplete').checked
    };

    // Send a PUT request to the API to update the item.
    fetch(`${uri}/${itemId}`, { // URI includes the item's ID.
        method: 'PUT', // HTTP method.
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item) // Convert the updated item to JSON.
    })
    .then(response => {
        if (!response.ok) {
             if (response.status === 400) { // Bad Request
                response.json().then(errors => {
                    console.error('Validation errors on update:', errors);
                    alert('Failed to update item. Please check your input. (e.g., Name cannot be empty)');
                }).catch(() => alert('Failed to update item. Bad input.')); // if response.json() fails
            } else if (response.status === 404) { // Not Found
                alert('Failed to update item. Item not found on server.');
            }
            else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } else {
            getTodos(); // Refresh the displayed list.
            closeEditForm(); // Hide the edit form.
        }
    })
    .catch(error => console.error('Unable to update item.', error)); // Logs errors.

    return false; // Prevent default form submission behavior.
}

// Function: closeEditForm
// Purpose: Hides the edit form.
function closeEditForm() {
    document.getElementById('editForm').style.display = 'none';
}

// Function: _displayCount
// Purpose: Updates the counter displaying the number of To-do items.
function _displayCount(itemCount) {
    // Determine the correct noun ("todo" or "todos") based on the count.
    const name = (itemCount === 1) ? 'todo' : 'todos';
    // Update the counter element's text.
    document.getElementById('counter').innerText = `${itemCount} ${name}`;
}

// Function: _displayItems
// Purpose: Renders the list of To-do items in the HTML table.
function _displayItems(data) {
    // Get a reference to the table body element.
    const tBody = document.getElementById('todos');
    tBody.innerHTML = ''; // Clear any existing rows from the table.

    _displayCount(data.length); // Update the item count display.

    // Create a button element for reuse.
    const button = document.createElement('button');

    // Iterate over each To-do item in the data.
    data.forEach(item => {
        // Create a checkbox for the "Is Complete" status.
        let isCompleteCheckbox = document.createElement('input');
        isCompleteCheckbox.type = 'checkbox';
        isCompleteCheckbox.disabled = true; // Display only, not interactive here.
        isCompleteCheckbox.checked = item.isComplete;

        // Create an edit button for each item.
        let editButton = button.cloneNode(false);
        editButton.innerText = 'Edit';
        // Add an event listener to show the edit form when clicked.
        editButton.setAttribute('onclick', `displayEditForm(${item.id})`);

        // Create a delete button for each item.
        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Delete';
        deleteButton.classList.add('delete-button'); // Add class for styling
        // Add an event listener to delete the item when clicked.
        deleteButton.setAttribute('onclick', `deleteTodo(${item.id})`);

        // Create a new table row.
        let tr = tBody.insertRow();

        // Create and populate the first cell (Is Complete checkbox).
        let td1 = tr.insertCell(0);
        td1.appendChild(isCompleteCheckbox);

        // Create and populate the second cell (Item Name).
        let td2 = tr.insertCell(1);
        let textNode = document.createTextNode(item.name);
        td2.appendChild(textNode);

        // Create and populate the third cell (Action Buttons).
        let td3 = tr.insertCell(2);
        td3.appendChild(editButton);
        td3.appendChild(deleteButton);
    });

    todos = data; // Update the local cache with the currently displayed items.
}

// Initial call to fetch and display To-do items when the script loads.
getTodos();
