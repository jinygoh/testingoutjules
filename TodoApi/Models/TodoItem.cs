// TodoApi/Models/TodoItem.cs
// This file defines the data model for a Todo item.
// It represents the structure of a todo task, including its ID, name, and completion status.
// This model is used by the TodoController to exchange data with clients (e.g., a web browser or a mobile app)
// and potentially with a database (though in this initial version, we might use an in-memory list).

namespace TodoApi.Models
{
    // Represents a single To-do item.
    public class TodoItem
    {
        // Property: Id
        // Purpose: A unique identifier for the To-do item.
        // Data Type: long (typically used for database primary keys)
        public long Id { get; set; }

        // Property: Name
        // Purpose: The description or title of the To-do task.
        // Data Type: string? (nullable string, allowing for the name to be potentially null, though usually it's required)
        public string? Name { get; set; }

        // Property: IsComplete
        // Purpose: A boolean flag indicating whether the To-do task has been completed.
        // Data Type: bool (true if completed, false otherwise)
        public bool IsComplete { get; set; }

        // Property: Secret (Example of a property that might not be exposed to the client)
        // Purpose: For demonstration, a property that might be used internally but not sent to the client.
        // We will see how to control what gets serialized and sent in the response when we build the DTO (Data Transfer Object) or in the controller.
        public string? Secret { get; set; }
    }
}
