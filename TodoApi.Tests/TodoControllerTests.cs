// TodoApi.Tests/TodoControllerTests.cs
// This file contains unit tests for the TodoController.
// Unit tests are used to verify that individual components (in this case, controller actions)
// of the application work as expected in isolation.
// We are using a style consistent with xUnit, a popular testing framework for .NET.
//
// To make these tests runnable, you would typically:
// 1. Create a new xUnit Test Project: `dotnet new xunit -o TodoApi.Tests`
// 2. Add a project reference from the test project to the main API project:
//    `dotnet add TodoApi.Tests/TodoApi.Tests.csproj reference TodoApi/TodoApi.csproj`
//    (Assuming TodoApi.csproj exists in the TodoApi directory)
// 3. Add necessary NuGet packages to the test project (e.g., Microsoft.AspNetCore.Mvc.Core).
// 4. Run tests using `dotnet test` in the TodoApi.Tests directory.
//
// Since our TodoController uses a static list, these tests will interact with that static list.
// For more robust and isolated testing, especially with database interaction,
// you would use techniques like mocking (e.g., with Moq library) for dependencies (like a DbContext or a service).

using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Controllers;
using TodoApi.Models;
using Xunit; // Placeholder for xUnit attribute. Actual xUnit requires the NuGet package.

// If xUnit is not actually available, these [Fact] attributes are just for show.
// To make this runnable, you'd need the xUnit framework and test runner.

namespace TodoApi.Tests
{
    public class TodoControllerTests
    {
        // Helper method to reset the static list in TodoController before each test.
        // This is a simple way to ensure test isolation when dealing with static data.
        // In a real application with dependency injection, you'd create fresh instances
        // of the controller and its dependencies for each test.
        private void ResetTodoItems()
        {
            var controllerType = typeof(TodoController);
            var todoItemsField = controllerType.GetField("_todoItems", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
            var nextIdField = controllerType.GetField("_nextId", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);

            if (todoItemsField != null)
            {
                todoItemsField.SetValue(null, new List<TodoItem>());
            }
            if (nextIdField != null)
            {
                nextIdField.SetValue(null, 1L); // Reset nextId to 1
            }
        }

        // Test Method: GetTodoItems_ReturnsOkResult_WithListOfTodoItems
        // Purpose: Verifies that the GetTodoItems action returns a 200 OK status code
        //          and a list of TodoItem objects.
        [Fact] // xUnit attribute to mark this as a test method.
        public void GetTodoItems_ReturnsOkResult_WithListOfTodoItems()
        {
            // Arrange
            ResetTodoItems(); // Ensure a clean state
            var controller = new TodoController();
            // Add some items directly for testing (simulating they were added via PostTodoItem)
            controller.PostTodoItem(new TodoItem { Name = "Test Item 1", IsComplete = false });
            controller.PostTodoItem(new TodoItem { Name = "Test Item 2", IsComplete = true });


            // Act
            // Call the GetTodoItems action method.
            var result = controller.GetTodoItems();

            // Assert
            // Check if the result is an ActionResult<IEnumerable<TodoItem>>.
            var actionResult = Assert.IsType<ActionResult<IEnumerable<TodoItem>>>(result);
            // Check if the HTTP response is OkObjectResult (200 OK).
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            // Check if the value returned is a list of TodoItem.
            var items = Assert.IsAssignableFrom<IEnumerable<TodoItem>>(okResult.Value);
            // Check if the correct number of items is returned.
            Assert.Equal(2, items.Count());
        }

        // Test Method: GetTodoItem_ReturnsNotFoundResult_WhenItemDoesNotExist
        // Purpose: Verifies that GetTodoItem returns a 404 Not Found when an invalid ID is provided.
        [Fact]
        public void GetTodoItem_ReturnsNotFoundResult_WhenItemDoesNotExist()
        {
            // Arrange
            ResetTodoItems();
            var controller = new TodoController();
            long nonExistentId = 999;

            // Act
            // Request an item with an ID that does not exist.
            var result = controller.GetTodoItem(nonExistentId);

            // Assert
            // Check if the result is an ActionResult<TodoItem>.
            var actionResult = Assert.IsType<ActionResult<TodoItem>>(result);
            // Check if the HTTP response is NotFoundResult (404 Not Found).
            Assert.IsType<NotFoundResult>(actionResult.Result);
        }

        // Test Method: GetTodoItem_ReturnsOkResult_WithTodoItem_WhenItemExists
        // Purpose: Verifies that GetTodoItem returns a 200 OK and the correct TodoItem when a valid ID is provided.
        [Fact]
        public void GetTodoItem_ReturnsOkResult_WithTodoItem_WhenItemExists()
        {
            // Arrange
            ResetTodoItems();
            var controller = new TodoController();
            var newItem = new TodoItem { Name = "Existing Test Item", IsComplete = false };
            // Add an item and get its created ID.
            var createdResult = controller.PostTodoItem(newItem).Result as CreatedAtActionResult;
            var createdItem = createdResult.Value as TodoItem;

            // Act
            // Request the item that was just added.
            var result = controller.GetTodoItem(createdItem.Id);

            // Assert
            var actionResult = Assert.IsType<ActionResult<TodoItem>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var item = Assert.IsType<TodoItem>(okResult.Value);
            Assert.Equal(createdItem.Id, item.Id); // Check if the IDs match.
            Assert.Equal(newItem.Name, item.Name); // Check if the names match.
        }

        // Test Method: PostTodoItem_ReturnsCreatedAtActionResult_WithTodoItem
        // Purpose: Verifies that PostTodoItem creates an item and returns a 201 CreatedAtAction result.
        [Fact]
        public void PostTodoItem_ReturnsCreatedAtActionResult_WithTodoItem()
        {
            // Arrange
            ResetTodoItems();
            var controller = new TodoController();
            var newItem = new TodoItem { Name = "New Post Item", IsComplete = false };

            // Act
            // Post a new item.
            var result = controller.PostTodoItem(newItem);

            // Assert
            var actionResult = Assert.IsType<ActionResult<TodoItem>>(result);
            // Check if the result is CreatedAtActionResult (201 Created).
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            // Check if the created item is returned in the result.
            var item = Assert.IsType<TodoItem>(createdAtActionResult.Value);
            Assert.Equal(newItem.Name, item.Name); // Check name.
            Assert.False(item.IsComplete); // Check default completion status.
            Assert.True(item.Id > 0); // Check if an ID was assigned.
        }

        // Test Method: PostTodoItem_ReturnsBadRequest_WhenNameIsEmpty
        // Purpose: Verifies that PostTodoItem returns a 400 Bad Request if the item name is empty.
        [Fact]
        public void PostTodoItem_ReturnsBadRequest_WhenNameIsEmpty()
        {
            // Arrange
            ResetTodoItems();
            var controller = new TodoController();
            var newItem = new TodoItem { Name = "", IsComplete = false }; // Empty name

            // Act
            var result = controller.PostTodoItem(newItem);

            // Assert
            var actionResult = Assert.IsType<ActionResult<TodoItem>>(result);
            // Check if the result is BadRequestObjectResult (400 Bad Request).
            Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        }


        // Test Method: PutTodoItem_ReturnsNoContentResult_WhenUpdateIsSuccessful
        // Purpose: Verifies that PutTodoItem returns a 204 No Content for a successful update.
        [Fact]
        public void PutTodoItem_ReturnsNoContentResult_WhenUpdateIsSuccessful()
        {
            // Arrange
            ResetTodoItems();
            var controller = new TodoController();
            // Add an initial item.
            var initialItem = new TodoItem { Name = "Initial Item for PUT", IsComplete = false };
            var postResult = controller.PostTodoItem(initialItem).Result as CreatedAtActionResult;
            var itemToUpdate = postResult.Value as TodoItem;

            // Modify the item for update.
            var updatedItemData = new TodoItem { Id = itemToUpdate.Id, Name = "Updated Item Name", IsComplete = true };

            // Act
            // Perform the PUT request to update the item.
            var result = controller.PutTodoItem(itemToUpdate.Id, updatedItemData);

            // Assert
            // Check if the result is NoContentResult (204 No Content).
            Assert.IsType<NoContentResult>(result);

            // Optionally, verify the item was actually updated by fetching it again.
            var getResult = controller.GetTodoItem(itemToUpdate.Id).Result as OkObjectResult;
            var fetchedItem = getResult.Value as TodoItem;
            Assert.Equal(updatedItemData.Name, fetchedItem.Name);
            Assert.Equal(updatedItemData.IsComplete, fetchedItem.IsComplete);
        }

        // Test Method: PutTodoItem_ReturnsBadRequest_WhenIdMismatch
        // Purpose: Verifies that PutTodoItem returns a 400 Bad Request if URL ID and body ID don't match.
        [Fact]
        public void PutTodoItem_ReturnsBadRequest_WhenIdMismatch()
        {
            // Arrange
            ResetTodoItems();
            var controller = new TodoController();
            long urlId = 1;
            var itemWithDifferentId = new TodoItem { Id = 2, Name = "Mismatch ID Item", IsComplete = false };

            // Act
            var result = controller.PutTodoItem(urlId, itemWithDifferentId);

            // Assert
            // Check if the result is BadRequestObjectResult.
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // Test Method: PutTodoItem_ReturnsNotFound_WhenItemToUpdateDoesNotExist
        // Purpose: Verifies that PutTodoItem returns a 404 Not Found if the item to update doesn't exist.
        [Fact]
        public void PutTodoItem_ReturnsNotFound_WhenItemToUpdateDoesNotExist()
        {
            // Arrange
            ResetTodoItems();
            var controller = new TodoController();
            long nonExistentId = 999;
            var itemData = new TodoItem { Id = nonExistentId, Name = "Non Existent", IsComplete = false };

            // Act
            var result = controller.PutTodoItem(nonExistentId, itemData);

            // Assert
            // Check if the result is NotFoundObjectResult.
            Assert.IsType<NotFoundObjectResult>(result);
        }


        // Test Method: DeleteTodoItem_ReturnsNoContentResult_WhenDeleteIsSuccessful
        // Purpose: Verifies that DeleteTodoItem returns a 204 No Content for a successful deletion.
        [Fact]
        public void DeleteTodoItem_ReturnsNoContentResult_WhenDeleteIsSuccessful()
        {
            // Arrange
            ResetTodoItems();
            var controller = new TodoController();
            // Add an item to be deleted.
            var itemToDelete = new TodoItem { Name = "Item to Delete", IsComplete = false };
            var postResult = controller.PostTodoItem(itemToDelete).Result as CreatedAtActionResult;
            var createdItem = postResult.Value as TodoItem;

            // Act
            // Perform the DELETE request.
            var result = controller.DeleteTodoItem(createdItem.Id);

            // Assert
            // Check if the result is NoContentResult (204 No Content).
            Assert.IsType<NoContentResult>(result);

            // Optionally, verify the item was actually deleted by trying to fetch it.
            var getResult = controller.GetTodoItem(createdItem.Id).Result;
            Assert.IsType<NotFoundResult>(getResult);
        }

        // Test Method: DeleteTodoItem_ReturnsNotFound_WhenItemToDeleteDoesNotExist
        // Purpose: Verifies that DeleteTodoItem returns a 404 Not Found if the item to delete doesn't exist.
        [Fact]
        public void DeleteTodoItem_ReturnsNotFound_WhenItemToDeleteDoesNotExist()
        {
            // Arrange
            ResetTodoItems();
            var controller = new TodoController();
            long nonExistentId = 999;

            // Act
            var result = controller.DeleteTodoItem(nonExistentId);

            // Assert
            // Check if the result is NotFoundObjectResult.
            Assert.IsType<NotFoundObjectResult>(result);
        }
    }
}
